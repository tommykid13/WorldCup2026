const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Chinese team name → team ID mapping
const TEAM_MAP = {
  '墨西哥': 'mex', '南非': 'rsa', '韩国': 'kor', '捷克': 'cze',
  '加拿大': 'can', '波黑': 'bih', '卡塔尔': 'qat', '瑞士': 'sui',
  '巴西': 'bra', '摩洛哥': 'mar', '海地': 'hai', '苏格兰': 'sco',
  '美国': 'usa', '巴拉圭': 'par', '澳大利亚': 'aus', '土耳其': 'tur',
  '德国': 'ger', '库拉索': 'cur', '科特迪瓦': 'civ', '厄瓜多尔': 'ecu',
  '荷兰': 'ned', '日本': 'jpn', '瑞典': 'swe', '突尼斯': 'tun',
  '比利时': 'bel', '埃及': 'egy', '伊朗': 'irn', '新西兰': 'nzl',
  '西班牙': 'esp', '佛得角': 'cpv', '沙特阿拉伯': 'ksa', '乌拉圭': 'uru',
  '法国': 'fra', '塞内加尔': 'sen', '伊拉克': 'irq', '挪威': 'nor',
  '阿根廷': 'arg', '阿尔及利亚': 'alg', '奥地利': 'aut', '约旦': 'jor',
  '葡萄牙': 'por', '刚果民主': 'cod', '乌兹别克斯坦': 'uzb', '哥伦比亚': 'col',
  '英格兰': 'eng', '克罗地亚': 'cro', '加纳': 'gha', '巴拿马': 'pan',
};

const POS_MAP = {
  '门将': { code: 'GK', zh: '门将' },
  '后卫': { code: 'DF', zh: '后卫' },
  '中场': { code: 'MF', zh: '中场' },
  '前锋': { code: 'FW', zh: '前锋' },
};

function clean(text) {
  if (!text) return '';
  return String(text).replace(/\s+/g, ' ').trim();
}

function parseBirthDate(text) {
  if (!text) return '';
  const m = String(text).match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  return '';
}

function isCoachRow(row) {
  if (row.length !== 1 || !row[0]) return false;
  const val = String(row[0]);
  // Rows that start with 主教练 prefix
  if (val.startsWith('主教练')) return true;
  // Single-name rows between team name and player header are coaches
  // We'll detect these contextually instead
  return false;
}

function isFootnoteRow(row) {
  if (row.length !== 1 || !row[0]) return false;
  const val = String(row[0]);
  return val.includes('公布了') || val.includes('初选名单') || val.includes('最终名单') || val.includes('于5月') || val.includes('于4月');
}

function isTeamName(row) {
  if (row.length !== 1 || !row[0]) return false;
  return !!TEAM_MAP[String(row[0]).trim()];
}

function isPlayerRow(row) {
  return row.length >= 3 && row[1] && row[2] && POS_MAP[String(row[1]).trim()];
}

function isColumnHeader(row) {
  return row[0] === '号码' || (row[1] === '位置' && row[2] === '球员姓名');
}

function isGroupHeader(row) {
  return row.length === 1 && String(row[0] || '').match(/^[A-L]组$/);
}

// Parse Excel
const wb = XLSX.readFile(path.join('D:', 'ClaudeCodeProjects', 'World Cup', '球员名单.xlsx'));
const ws = wb.Sheets['Sheet1'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

const teams = JSON.parse(fs.readFileSync('src/data/teams/index.json', 'utf8'));
const teamById = {};
teams.forEach(t => { teamById[t.id] = t; });

// State machine approach
let state = 'idle'; // idle | found_team | found_coach | in_players
let currentTeamId = null;
let currentCoach = null;
let currentPlayers = [];
const teamData = {};
const coaches = {};

for (let i = 0; i < rows.length; i++) {
  const row = rows[i] || [];
  if (row.length === 0) continue;

  // Group header resets state
  if (isGroupHeader(row)) {
    if (currentTeamId) {
      teamData[currentTeamId] = currentPlayers;
      coaches[currentTeamId] = currentCoach;
    }
    state = 'idle';
    currentTeamId = null;
    currentCoach = null;
    currentPlayers = [];
    continue;
  }

  // Team name found
  if (isTeamName(row)) {
    // Save previous team (even with 0 players)
    if (currentTeamId) {
      teamData[currentTeamId] = currentPlayers;
      coaches[currentTeamId] = currentCoach;
    }
    currentTeamId = TEAM_MAP[String(row[0]).trim()];
    currentCoach = null;
    currentPlayers = [];
    state = 'found_team';
    continue;
  }

  // Coach with prefix "主教练："
  if (row.length === 1 && String(row[0] || '').startsWith('主教练')) {
    const m = String(row[0]).match(/主教练[：:]\s*(.+)/);
    if (m && m[1].trim()) {
      currentCoach = m[1].trim();
    }
    state = 'found_coach';
    continue;
  }

  // Single name row after team or after empty 主教练： = coach name
  if ((state === 'found_team' || state === 'found_coach') && !currentCoach &&
      row.length === 1 && row[0] && !isFootnoteRow(row) && !isColumnHeader(row) && !isGroupHeader(row) && !isTeamName(row)) {
    currentCoach = String(row[0]).trim();
    state = 'found_coach';
    continue;
  }

  // Column header
  if (isColumnHeader(row)) {
    state = 'in_players';
    continue;
  }

  // Footnote row
  if (isFootnoteRow(row)) continue;

  // Player data
  if (state === 'in_players' && isPlayerRow(row)) {
    const pos = POS_MAP[String(row[1]).trim()];
    const playerName = clean(row[2]);
    const birthDate = parseBirthDate(String(row[3] || ''));
    const caps = Number(row[4]) || 0;
    const goals = Number(row[5]) || 0;
    const club = clean(row[6] || '');
    const number = row[0] ? Number(row[0]) : null;

    currentPlayers.push({
      id: `${currentTeamId}-${currentPlayers.length + 1}`,
      nameZh: playerName,
      nameEn: '',
      number: number || 0,
      position: pos.code,
      positionZh: pos.zh,
      dateOfBirth: birthDate,
      club: { nameZh: club, nameEn: '' },
      caps,
      goals,
    });
    continue;
  }
}

// Save last team
if (currentTeamId) {
  teamData[currentTeamId] = currentPlayers;
  coaches[currentTeamId] = currentCoach;
}

// Generate team detail JSON files for ALL teams
let teamsCreated = 0;
let totalPlayers = 0;

for (const team of teams) {
  const teamId = team.id;
  const squad = teamData[teamId] || [];
  const keyPlayers = [...squad]
    .sort((a, b) => b.caps - a.caps)
    .slice(0, 5)
    .map(p => p.nameZh);

  const detail = { ...team, squad, keyPlayers };

  fs.writeFileSync(
    `src/data/teams/${teamId}.json`,
    JSON.stringify(detail, null, 2)
  );
  teamsCreated++;
  totalPlayers += squad.length;
}

// Update coaches in index.json
let coachesUpdated = 0;
let coachesMissing = 0;
for (const team of teams) {
  const coachName = coaches[team.id];
  if (coachName) {
    team.coach.nameZh = coachName;
    coachesUpdated++;
  } else {
    coachesMissing++;
  }
}
fs.writeFileSync('src/data/teams/index.json', JSON.stringify(teams, null, 2));

console.log(`\n=== Summary ===`);
console.log(`Teams created: ${teamsCreated}/48`);
console.log(`Total players: ${totalPlayers}`);
console.log(`Coaches updated: ${coachesUpdated}`);
console.log(`Coaches missing: ${coachesMissing}`);
const missing = Object.keys(teamById).filter(id => !teamData[id]);
if (missing.length > 0) {
  console.log(`\nMissing teams (${missing.length}):`);
  missing.forEach(id => console.log(`  ${id}: ${teamById[id].nameZh}`));
}

// Show sample of parsed data
const sampleId = 'mex';
if (teamData[sampleId]) {
  console.log(`\n=== Sample: ${teamById[sampleId].nameZh} ===`);
  console.log(`Coach: ${coaches[sampleId]}`);
  console.log(`Players: ${teamData[sampleId].length}`);
  console.log(`First 3 players:`);
  teamData[sampleId].slice(0, 3).forEach(p => console.log(`  ${p.positionZh} ${p.nameZh} | ${p.dateOfBirth} | ${p.caps}场${p.goals}球 | ${p.club.nameZh}`));
}
