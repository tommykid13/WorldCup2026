import type { TeamSummary, TeamDetail, Player } from '@/lib/types';
import teamsData from '@/data/teams/index.json';

// Data may be either { teams: [...] } or a plain array
const teams: TeamSummary[] = Array.isArray(teamsData)
  ? (teamsData as unknown as TeamSummary[])
  : (teamsData as { teams: TeamSummary[] }).teams;

export function getAllTeams(): TeamSummary[] {
  return teams.sort((a, b) => a.fifaRanking - b.fifaRanking);
}

export function getTeamsByConfederation(confId: string): TeamSummary[] {
  return teams.filter((t) => t.confederation === confId);
}

export function getTeamsByGroup(group: string): TeamSummary[] {
  return teams.filter((t) => t.group === group);
}

export function getTeamById(id: string): TeamSummary | undefined {
  return teams.find((t) => t.id === id);
}

export async function getTeamDetail(id: string): Promise<TeamDetail | null> {
  try {
    const detail = await import(`@/data/teams/${id}.json`);
    return detail.default as TeamDetail;
  } catch {
    return null;
  }
}

export function searchTeams(query: string): TeamSummary[] {
  const q = query.toLowerCase();
  return teams.filter(
    (t) =>
      t.nameZh.includes(q) ||
      t.nameEn.toLowerCase().includes(q) ||
      t.id.includes(q)
  );
}

export function getAllPlayers(): (Player & { teamId: string; teamNameZh: string })[] {
  // This will be populated from team detail files
  // For now, returns empty - will be enhanced when team detail JSONs are loaded
  return [];
}

export function getTeamGroups(): Record<string, TeamSummary[]> {
  const groups: Record<string, TeamSummary[]> = {};
  for (const team of teams) {
    if (!groups[team.group]) groups[team.group] = [];
    groups[team.group].push(team);
  }
  return groups;
}
