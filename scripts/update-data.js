/**
 * update-data.js
 *
 * 用法: node scripts/update-data.js
 *
 * 读取 data-input.json，更新以下文件:
 *   - src/data/schedule/index.json  (比分 + 淘汰赛队名)
 *   - src/data/standings.json       (小组积分榜)
 *   - src/data/stats.json           (射手榜 + 助攻榜)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT_PATH = path.join(ROOT, 'data-input.json');
const SCHEDULE_PATH = path.join(ROOT, 'src/data/schedule/index.json');
const TEAMS_PATH = path.join(ROOT, 'src/data/teams/index.json');
const STANDINGS_PATH = path.join(ROOT, 'src/data/standings.json');
const STATS_PATH = path.join(ROOT, 'src/data/stats.json');

// ── helpers ──

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function writeJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function log(msg) {
  console.log(`[update] ${msg}`);
}

// ── main ──

function main() {
  // 1. 读取输入
  if (!fs.existsSync(INPUT_PATH)) {
    console.error('错误: data-input.json 不存在，请先创建');
    process.exit(1);
  }
  const input = readJSON(INPUT_PATH);
  const schedule = readJSON(SCHEDULE_PATH);
  const teamsArr = readJSON(TEAMS_PATH);

  // 建立 teamId → teamInfo 映射
  const teamMap = {};
  for (const t of teamsArr) {
    teamMap[t.id] = { nameZh: t.nameZh, nameEn: t.nameEn, flagCode: t.flagCode, group: t.group };
  }

  // ── 2. 更新小组赛比分 ──
  const groupResults = input.groupResults || {};
  let updatedGroupMatches = 0;

  for (const match of schedule.groupStage) {
    const r = groupResults[match.id];
    if (r) {
      match.status = 'completed';
      match.homeScore = r.hs;
      match.awayScore = r.as;
      updatedGroupMatches++;
    }
  }
  log(`更新了 ${updatedGroupMatches} 场小组赛比分`);

  // ── 3. 计算小组积分榜 ──
  const groupStandings = {};
  const groups = 'ABCDEFGHIJKL'.split('');

  for (const g of groups) {
    groupStandings[g] = [];
  }

  // 初始化每个球队的积分数据
  const standingsMap = {};
  for (const t of teamsArr) {
    standingsMap[t.id] = {
      teamId: t.id,
      nameZh: t.nameZh,
      flagCode: t.flagCode,
      group: t.group,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    };
  }

  // 从已完成的比赛计算积分
  for (const match of schedule.groupStage) {
    if (match.status !== 'completed') continue;

    const home = standingsMap[match.homeTeam.id];
    const away = standingsMap[match.awayTeam.id];
    if (!home || !away) continue;

    const hs = match.homeScore;
    const as = match.awayScore;

    home.played++;
    away.played++;
    home.gf += hs;
    home.ga += as;
    away.gf += as;
    away.ga += hs;

    if (hs > as) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (hs < as) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }

  // 按组分类并排序
  for (const g of groups) {
    groupStandings[g] = Object.values(standingsMap)
      .filter(s => s.group === g)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return 0;
      });
  }

  writeJSON(STANDINGS_PATH, groupStandings);
  log(`生成了积分榜: ${Object.values(groupStandings).some(g => g.some(s => s.played > 0)) ? '有比赛数据' : '暂无比赛数据'}`);

  // ── 4. 更新淘汰赛对阵 ──
  const knockoutTeams = input.knockoutTeams || {};
  const knockoutResults = input.knockoutResults || {};

  // 解析淘汰赛队伍引用 (如 "1A" → knockoutTeams["1A"], "胜M73" → M73的胜者)
  function resolveTeamRef(ref) {
    // 直接是队伍 ID（3字母）
    if (teamMap[ref]) {
      return { id: ref, ...teamMap[ref] };
    }
    // 小组排名引用: "1A" = A组第1, "2B" = B组第2
    const rankMatch = ref.match(/^(\d)([A-L])$/);
    if (rankMatch) {
      const teamId = knockoutTeams[ref];
      if (teamId && teamMap[teamId]) {
        return { id: teamId, ...teamMap[teamId] };
      }
      return null; // 尚未确定
    }
    // "胜M73" = M73的胜者
    const winMatch = ref.match(/^胜(M\d+)$/);
    if (winMatch) {
      const matchId = winMatch[1];
      const result = knockoutResults[matchId];
      if (result) {
        // 需要从 knockoutStage 中找到这场比赛确定主客队
        const koMatch = findKnockoutMatch(schedule.knockoutStage, matchId);
        if (koMatch && koMatch._homeId && koMatch._awayId) {
          const winnerId = result.hs > result.as ? koMatch._homeId : koMatch._awayId;
          if (teamMap[winnerId]) return { id: winnerId, ...teamMap[winnerId] };
        }
      }
      return null;
    }
    // "负M101" = M101的败者
    const loseMatch = ref.match(/^负(M\d+)$/);
    if (loseMatch) {
      const matchId = loseMatch[1];
      const result = knockoutResults[matchId];
      if (result) {
        const koMatch = findKnockoutMatch(schedule.knockoutStage, matchId);
        if (koMatch && koMatch._homeId && koMatch._awayId) {
          const loserId = result.hs < result.as ? koMatch._homeId : koMatch._awayId;
          if (teamMap[loserId]) return { id: loserId, ...teamMap[loserId] };
        }
      }
      return null;
    }
    return null;
  }

  function findKnockoutMatch(knockoutStage, matchId) {
    for (const round of knockoutStage) {
      for (const m of round.matches) {
        if (m.id === matchId) return m;
      }
    }
    return null;
  }

  // 先解析所有淘汰赛的 home/away 为真实队名
  // 需要按轮次顺序处理（R32 → R16 → QF → SF → Final）
  for (const round of schedule.knockoutStage) {
    for (const match of round.matches) {
      const homeTeam = resolveTeamRef(match.home);
      const awayTeam = resolveTeamRef(match.away);

      if (homeTeam) {
        match._homeId = homeTeam.id;
        match.homeTeam = { id: homeTeam.id, nameZh: homeTeam.nameZh, flagCode: homeTeam.flagCode };
      }
      if (awayTeam) {
        match._awayId = awayTeam.id;
        match.awayTeam = { id: awayTeam.id, nameZh: awayTeam.nameZh, flagCode: awayTeam.flagCode };
      }

      // 更新比分
      const r = knockoutResults[match.id];
      if (r) {
        match.status = 'completed';
        match.homeScore = r.hs;
        match.awayScore = r.as;
      }
    }
  }

  log(`更新了淘汰赛对阵数据`);

  // ── 5. 保存更新后的 schedule ──
  // 清理内部字段 _homeId/_awayId
  const cleanSchedule = JSON.parse(JSON.stringify(schedule));
  for (const round of cleanSchedule.knockoutStage) {
    for (const match of round.matches) {
      delete match._homeId;
      delete match._awayId;
    }
  }
  writeJSON(SCHEDULE_PATH, cleanSchedule);

  // ── 6. 生成射手/助攻数据 ──
  const scorersInput = input.scorers || [];
  const assistsInput = input.assists || [];

  const scorers = scorersInput.map((s, i) => {
    const team = teamMap[s.team] || {};
    return {
      rank: i + 1,
      name: s.name,
      teamId: s.team,
      teamNameZh: team.nameZh || '',
      flagCode: team.flagCode || '',
      goals: s.goals,
      assists: s.assists || 0,
      penalties: s.penalties || 0,
      appearances: s.appearances || 0,
    };
  });

  const assists = assistsInput.map((a, i) => {
    const team = teamMap[a.team] || {};
    return {
      rank: i + 1,
      name: a.name,
      teamId: a.team,
      teamNameZh: team.nameZh || '',
      flagCode: team.flagCode || '',
      assists: a.assists,
      goals: a.goals || 0,
      keyPasses: a.keyPasses || 0,
      appearances: a.appearances || 0,
    };
  });

  const statsData = {
    scorers,
    assists,
    summary: input.summary || { totalGoals: 0, totalAssists: 0, avgGoalsPerMatch: 0, hatTricks: 0 },
  };

  writeJSON(STATS_PATH, statsData);
  log(`生成了射手榜 (${scorers.length} 人) 和助攻榜 (${assists.length} 人)`);

  log('完成!');
}

main();
