/**
 * admin.js — 2026 世界杯管理后台（本地 CLI）
 *
 * 用法: npm run admin
 *
 * 菜单 1-4 只改 data-input.json；菜单 6 才执行 update + git push。
 * update-data.js 保持 IIFE 形态，本脚本通过 execSync 调用。
 */

const readline = require('node:readline');
const { stdin, stdout } = require('node:process');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const INPUT_PATH = path.join(ROOT, 'data-input.json');
const SCHEDULE_PATH = path.join(ROOT, 'src/data/schedule/index.json');
const TEAMS_PATH = path.join(ROOT, 'src/data/teams/index.json');
const CHANGED_FILES = [
  'data-input.json',
  'src/data/schedule/index.json',
  'src/data/standings.json',
  'src/data/stats.json',
];

// ── 全局状态 ──
let inputData = null;
let teams = [];
let teamIds = new Set();
let teamMap = {};
let schedule = null;
const sessionLog = new Set();

// ── 自管 line reader（兼容管道和 TTY）──
const rl = readline.createInterface({ input: stdin, output: stdout, crlfDelay: Infinity });
const pendingLines = [];
let lineWaiter = null;
rl.on('line', line => {
  if (lineWaiter) {
    const w = lineWaiter;
    lineWaiter = null;
    w(line);
  } else {
    pendingLines.push(line);
  }
});
rl.on('close', () => {
  // stdin 关闭时，若还有 question pending，给它空串避免 hang
  if (lineWaiter) {
    const w = lineWaiter;
    lineWaiter = null;
    w('');
  }
});

// ── I/O ──
function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
function writeJSON(p, data) { fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf-8'); }

function loadAll() {
  inputData = readJSON(INPUT_PATH);
  teams = readJSON(TEAMS_PATH);
  teamIds = new Set(teams.map(t => t.id));
  teamMap = Object.fromEntries(teams.map(t => [t.id, t]));
  schedule = readJSON(SCHEDULE_PATH);
}

function saveInput() { writeJSON(INPUT_PATH, inputData); }
function logSession(tag) { sessionLog.add(tag); }

// ── prompt helpers ──
function ask(prompt) {
  stdout.write(prompt);
  if (pendingLines.length > 0) return Promise.resolve(pendingLines.shift());
  return new Promise(resolve => { lineWaiter = resolve; });
}

async function askInt(label, opts = {}) {
  const { min = 0, max = Infinity, dft } = opts;
  while (true) {
    const suffix = dft !== undefined ? ` [${dft}]: ` : ': ';
    const raw = (await ask(label + suffix)).trim();
    const v = raw === '' ? dft : Number(raw);
    if (Number.isInteger(v) && v >= min && v <= max) return v;
    console.log(`  ⚠ 无效，请输入 ${min}-${max === Infinity ? '∞' : max} 之间的整数`);
  }
}

async function askConfirm(question, defaultYes = false) {
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  const ans = (await ask(`${question} ${hint} `)).trim().toLowerCase();
  if (ans === '') return defaultYes;
  return ans === 'y' || ans === 'yes';
}

async function askTeamId() {
  while (true) {
    const raw = (await ask('  队伍 ID (3字母, 如 kor; ? 列出全部): ')).trim().toLowerCase();
    if (raw === '?') {
      const byGroup = {};
      for (const t of teams) (byGroup[t.group] ||= []).push(t);
      for (const g of Object.keys(byGroup).sort()) {
        console.log(`    ${g}组: ` + byGroup[g].map(t => `${t.nameZh}(${t.id})`).join(' '));
      }
      continue;
    }
    if (teamIds.has(raw)) {
      console.log(`    ✓ ${teamMap[raw].nameZh} (${raw})`);
      return raw;
    }
    const fuzzy = teams.filter(t =>
      t.id.includes(raw) || t.nameZh.includes(raw) || t.nameEn.toLowerCase().includes(raw)
    );
    if (fuzzy.length === 1) {
      console.log(`    ✓ ${fuzzy[0].nameZh} (${fuzzy[0].id})`);
      return fuzzy[0].id;
    }
    console.log('    ⚠ 未匹配到，请重试');
  }
}

// ── 菜单 1: 录小组赛比分 ──
async function actionRecordGroupScores() {
  const upcoming = schedule.groupStage.filter(m => m.status === 'upcoming');
  if (upcoming.length === 0) {
    console.log('\n  所有小组赛已完赛。\n');
    return;
  }
  console.log('\n📋 即将到来的小组赛（前 30 场）:');
  upcoming.slice(0, 30).forEach(m => {
    console.log(`  ${m.id}  ${m.homeTeam.nameZh} vs ${m.awayTeam.nameZh}  ${m.date} ${m.time}`);
  });
  if (upcoming.length > 30) console.log(`  ... 还有 ${upcoming.length - 30} 场`);

  inputData.groupResults ||= {};
  while (true) {
    const id = (await ask('\n比赛 ID (如 GM003, 空结束): ')).toUpperCase();
    if (!id) break;
    const match = schedule.groupStage.find(m => m.id === id);
    if (!match) { console.log('  ⚠ 未找到该比赛'); continue; }
    console.log(`  ${match.homeTeam.nameZh} vs ${match.awayTeam.nameZh}`);
    const hs = await askInt(`  ${match.homeTeam.nameZh} 得分`);
    const as = await askInt(`  ${match.awayTeam.nameZh} 得分`);
    inputData.groupResults[id] = { hs, as };
    saveInput();
    logSession(id);
    console.log(`  ✓ 已记录 ${id}: ${hs}-${as}\n`);
  }
}

// ── 菜单 2: 录淘汰赛 ──
async function actionRecordKnockout() {
  console.log('\n📋 淘汰赛:');
  for (const round of schedule.knockoutStage) {
    console.log(`\n  【${round.round}】`);
    for (const m of round.matches) {
      const homeLabel = m.homeTeam?.nameZh ?? `[${m.home}]`;
      const awayLabel = m.awayTeam?.nameZh ?? `[${m.away}]`;
      const score = m.status === 'completed' ? `  ${m.homeScore}-${m.awayScore}` : '';
      console.log(`    ${m.id}  ${homeLabel} vs ${awayLabel}${score}  ${m.date}`);
    }
  }

  inputData.knockoutResults ||= {};
  inputData.knockoutTeams ||= {};
  while (true) {
    const id = (await ask('\n比赛 ID (如 M73, 空结束): ')).toUpperCase();
    if (!id) break;
    let match = null;
    for (const round of schedule.knockoutStage) {
      match = round.matches.find(m => m.id === id);
      if (match) break;
    }
    if (!match) { console.log('  ⚠ 未找到该比赛'); continue; }

    for (const slot of ['home', 'away']) {
      const ref = match[slot];
      const resolved = match[`${slot}Team`] || inputData.knockoutTeams[ref];
      if (!resolved) {
        console.log(`  ${slot === 'home' ? '主' : '客'}队槽位 "${ref}" 未确定`);
        if (await askConfirm(`  手动指定该槽位的队伍?`, false)) {
          const teamId = await askTeamId();
          inputData.knockoutTeams[ref] = teamId;
          saveInput();
          logSession(`ko-team:${ref}`);
          console.log(`  ✓ 已设 ${ref} = ${teamMap[teamId].nameZh} (${teamId})`);
        }
      }
    }

    const homeName = match.homeTeam?.nameZh
      || (inputData.knockoutTeams[match.home] && teamMap[inputData.knockoutTeams[match.home]]?.nameZh)
      || `[${match.home}]`;
    const awayName = match.awayTeam?.nameZh
      || (inputData.knockoutTeams[match.away] && teamMap[inputData.knockoutTeams[match.away]]?.nameZh)
      || `[${match.away}]`;
    const hs = await askInt(`  ${homeName} 得分`);
    const as = await askInt(`  ${awayName} 得分`);
    inputData.knockoutResults[id] = { hs, as };
    saveInput();
    logSession(`ko:${id}`);
    console.log(`  ✓ 已记录 ${id}: ${hs}-${as}\n`);
  }
}

// ── 菜单 3/4: 编辑射手榜 / 助攻榜 ──
const SCORER_FIELDS = [
  { key: 'goals', label: '进球' },
  { key: 'assists', label: '助攻' },
  { key: 'penalties', label: '点球' },
  { key: 'appearances', label: '出场' },
];
const ASSIST_FIELDS = [
  { key: 'assists', label: '助攻' },
  { key: 'goals', label: '进球' },
  { key: 'keyPasses', label: '关键传球' },
  { key: 'appearances', label: '出场' },
];

async function actionEditLeaderboard(key, fields, title) {
  const current = inputData[key] || [];
  console.log(`\n📊 当前 ${title} (${current.length} 人):`);
  current.forEach((e, i) => {
    const teamName = teamMap[e.team]?.nameZh || e.team;
    const stats = fields.map(f => `${f.label}=${e[f.key] ?? 0}`).join(' ');
    console.log(`  ${i + 1}. ${e.name} [${teamName}]  ${stats}`);
  });

  console.log('\n  [1] 全部重新录入');
  console.log('  [2] 追加新条目（保留现有）');
  console.log('  [3] 按索引删除');
  const mode = (await ask('\n选择模式 [1/2/3]: ')) || '1';

  let newList;
  if (mode === '3') {
    if (current.length === 0) { console.log('  （榜单为空）\n'); return; }
    newList = [...current];
    const idx = await askInt('删除的序号', { min: 1, max: current.length });
    const removed = newList.splice(idx - 1, 1)[0];
    console.log(`  ✓ 删除 ${removed.name}`);
  } else {
    // [1] 重新录入 → 从空开始；[2] 追加 → 保留现有
    newList = mode === '2' ? [...current] : [];
    const startIdx = newList.length;
    if (mode === '2' && startIdx > 0) {
      console.log(`\n  在现有 ${startIdx} 人基础上追加（空球员名结束）。`);
    } else {
      console.log('\n  逐条录入，空球员名结束。');
    }
    let i = startIdx + 1;
    while (true) {
      const name = (await ask(`\n  #${i} 球员中文名: `)).trim();
      if (!name) break;
      const team = await askTeamId();
      const entry = { name, team };
      for (const f of fields) {
        entry[f.key] = await askInt(`    ${f.label}`, { min: 0, dft: 0 });
      }
      newList.push(entry);
      i++;
    }
  }

  inputData[key] = newList;
  saveInput();
  logSession(key);
  console.log(`\n  ✓ ${title} 已更新（${newList.length} 人）\n`);
}

// ── 菜单 5: 预览 ──
function actionPreview() {
  console.log('\n📋 data-input.json 当前内容:');
  const gr = inputData.groupResults || {};
  console.log(`  小组赛比分: ${Object.keys(gr).length} 场`);
  for (const id of Object.keys(gr).sort()) console.log(`    ${id}: ${gr[id].hs}-${gr[id].as}`);

  const kr = inputData.knockoutResults || {};
  console.log(`  淘汰赛比分: ${Object.keys(kr).length} 场`);
  for (const id of Object.keys(kr).sort()) console.log(`    ${id}: ${kr[id].hs}-${kr[id].as}`);

  const kt = inputData.knockoutTeams || {};
  console.log(`  淘汰赛对阵指定: ${Object.keys(kt).length} 项`);
  for (const ref of Object.keys(kt)) console.log(`    ${ref} → ${kt[ref]}`);

  console.log(`  射手榜: ${(inputData.scorers || []).length} 人`);
  console.log(`  助攻榜: ${(inputData.assists || []).length} 人`);

  console.log(`  本会话已改: ${sessionLog.size === 0 ? '（无）' : [...sessionLog].sort().join(', ')}`);

  try {
    const out = execSync('git diff --stat', { cwd: ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    if (out.trim()) {
      console.log('\n  git diff --stat:');
      console.log('  ' + out.trim().split('\n').join('\n  '));
    } else {
      console.log('\n  (无 git 改动)');
    }
  } catch { /* ignore */ }
  console.log();
}

// ── 菜单 6: 执行 update + push ──
function computeSummary() {
  let totalGoals = 0;
  let completedMatches = 0;
  for (const id in inputData.groupResults) {
    totalGoals += inputData.groupResults[id].hs + inputData.groupResults[id].as;
    completedMatches++;
  }
  for (const id in inputData.knockoutResults) {
    totalGoals += inputData.knockoutResults[id].hs + inputData.knockoutResults[id].as;
    completedMatches++;
  }
  const totalAssists = (inputData.assists || []).reduce((s, x) => s + (x.assists || 0), 0);
  const hatTricks = (inputData.scorers || []).filter(s => (s.goals || 0) >= 3).length;
  const avg = completedMatches > 0 ? Math.round((totalGoals / completedMatches) * 100) / 100 : 0;
  return { totalGoals, totalAssists, avgGoalsPerMatch: avg, hatTricks };
}

function buildCommitMessage() {
  const tags = [...sessionLog].sort();
  const matchTags = tags.filter(t => /^GM\d+$/.test(t));
  const koTags = tags.filter(t => /^ko:/.test(t)).map(t => t.replace('ko:', ''));
  const koTeamTags = tags.filter(t => t.startsWith('ko-team:')).map(t => t.replace('ko-team:', 'KO-slot:'));
  const listTags = tags.filter(t => t === 'scorers' || t === 'assists');

  const parts = [];
  if (matchTags.length) parts.push(matchTags.join(' '));
  if (koTags.length) parts.push(koTags.join(' '));
  if (koTeamTags.length) parts.push(koTeamTags.join(' '));
  if (listTags.length) parts.push(listTags.join(' + '));

  return parts.length ? `feat(data): update ${parts.join(' — ')}` : 'feat(data): refresh';
}

async function actionApply() {
  if (sessionLog.size === 0) {
    console.log('\n  本会话无改动（data-input.json 已是最新）。');
    if (!await askConfirm('  仍要跑 update + push?', false)) return;
  }

  // 1. 算 summary 并写入
  const summary = computeSummary();
  inputData.summary = summary;
  saveInput();

  // 2. 生成 commit msg
  const commitMsg = buildCommitMessage();

  console.log('\n⚙️  将执行以下步骤:');
  console.log('  1. node scripts/update-data.js   (生成 standings / stats / schedule)');
  console.log(`  2. git add ${CHANGED_FILES.join(' ')}`);
  console.log(`  3. git commit -m "${commitMsg}"`);
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, encoding: 'utf-8' }).trim();
  console.log(`  4. git push origin ${branch} → 触发 Cloudflare 自动构建`);
  console.log(`\n  summary 自动计算: totalGoals=${summary.totalGoals} totalAssists=${summary.totalAssists} avg=${summary.avgGoalsPerMatch} hat3=${summary.hatTricks}`);

  if (!await askConfirm('\n  确认执行?', false)) {
    console.log('  ⏭ 已取消。\n');
    return;
  }

  // 3. update
  try {
    console.log('\n▶ 运行 update-data.js ...');
    execSync('node scripts/update-data.js', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    console.error('\n❌ update-data.js 失败:');
    console.error(e.stderr?.toString() || e.message);
    console.error('  已中止，未做 git 操作。');
    return;
  }

  // 4. git add + commit
  try {
    console.log('\n▶ git add ...');
    execSync(`git add ${CHANGED_FILES.join(' ')}`, { cwd: ROOT, stdio: 'inherit' });
    console.log('▶ git commit ...');
    const fullMsg = `${commitMsg}\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`;
    execSync('git commit -m ' + JSON.stringify(fullMsg), { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    console.error('\n❌ git add/commit 失败:', e.message);
    return;
  }

  // 5. push
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, encoding: 'utf-8' }).trim();
    console.log(`\n▶ git push origin ${branch} ...`);
    execSync(`git push origin ${branch}`, { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    const stderr = e.stderr?.toString() || e.message;
    console.error('\n❌ push 失败:');
    if (/timed out|network|connection|ENOTFOUND|ECONNREFUSED/i.test(stderr)) {
      console.error('  → 网络问题，请检查连接后重试: git push');
    } else if (/non-fast-forward|rejected|fetch first/i.test(stderr)) {
      console.error('  → 远端有新提交，请先: git pull --rebase');
    } else if (/authentication|403|permission|fatal: could not read/i.test(stderr)) {
      console.error('  → 鉴权失败，检查 git 凭据。');
    } else {
      console.error('  ' + stderr.split('\n').slice(0, 10).join('\n  '));
    }
    try {
      const hash = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf-8' }).trim();
      console.error(`\n  本地 commit ${hash} 已生成，可手动重试: git push`);
    } catch { /* ignore */ }
    return;
  }

  sessionLog.clear();
  console.log('\n✅ 完成! Cloudflare Pages 将自动构建部署。\n');
}

// ── 菜单 7: 退出 ──
async function actionExit() {
  if (sessionLog.size > 0) {
    console.log(`\n  ⚠ 本会话还有 ${sessionLog.size} 项未推送改动: ${[...sessionLog].sort().join(', ')}`);
    if (!await askConfirm('  确认退出（不推送）?', false)) return false;
  }
  return true;
}

// ── 启动检查 ──
function warnIfDirty() {
  try {
    const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf-8' });
    const dirty = status.split('\n')
      .map(l => l.slice(3).trim())
      .filter(Boolean)
      .filter(p => CHANGED_FILES.includes(p));
    if (dirty.length > 0) {
      console.log('⚠ git 工作区有被管理文件的未提交改动:');
      dirty.forEach(f => console.log(`    ${f}`));
      console.log('  （可能是上次 admin 会话未完成，或手动编辑过。）\n');
    }
  } catch { /* git 不可用就忽略 */ }
}

// ── 主菜单 ──
function printMenu() {
  console.log('\n📦 2026 世界杯管理后台');
  console.log(`   本会话改动: ${sessionLog.size === 0 ? '（无）' : [...sessionLog].sort().join(', ')}`);
  console.log('  ────────────────────────────────────');
  console.log('   1) 录入小组赛比分');
  console.log('   2) 录入淘汰赛比分/对阵');
  console.log('   3) 编辑射手榜');
  console.log('   4) 编辑助攻榜');
  console.log('   5) 预览 data-input.json');
  console.log('   6) 执行 update + git push');
  console.log('   7) 退出');
}

async function main() {
  if (process.stdin.setEncoding) process.stdin.setEncoding('utf-8');
  console.log('━'.repeat(48));
  console.log('  2026 FifaWorld Cup — 本地管理 CLI');
  console.log('━'.repeat(48));

  try {
    loadAll();
  } catch (e) {
    console.error('\n❌ 加载数据失败:', e.message);
    rl.close();
    process.exit(1);
  }

  warnIfDirty();

  process.on('SIGINT', () => {
    console.log('\n\n中断退出。');
    if (sessionLog.size > 0) {
      console.log(`⚠ 本会话有 ${sessionLog.size} 项未推送改动已保存在 data-input.json`);
    }
    rl.close();
    process.exit(130);
  });

  while (true) {
    printMenu();
    const choice = (await ask('\n选择 [1-7]: ')).trim();
    switch (choice) {
      case '1': await actionRecordGroupScores(); break;
      case '2': await actionRecordKnockout(); break;
      case '3': await actionEditLeaderboard('scorers', SCORER_FIELDS, '射手榜'); break;
      case '4': await actionEditLeaderboard('assists', ASSIST_FIELDS, '助攻榜'); break;
      case '5': actionPreview(); break;
      case '6': await actionApply(); break;
      case '7':
        if (await actionExit()) {
          console.log('\n再见!');
          rl.close();
          process.exit(0);
        }
        break;
      default:
        console.log('  ⚠ 无效选项');
    }
  }
}

main();
