import type { TournamentSummary, TournamentDetail } from '@/lib/types';
import tournamentsData from '@/data/tournaments/index.json';

const tournaments: TournamentSummary[] = Array.isArray(tournamentsData)
  ? (tournamentsData as unknown as TournamentSummary[])
  : (tournamentsData as { tournaments: TournamentSummary[] }).tournaments;

export function getAllTournaments(): TournamentSummary[] {
  return tournaments.sort((a, b) => b.year - a.year);
}

export function getTournamentByYear(year: number): TournamentSummary | undefined {
  return tournaments.find((t) => t.year === year);
}

export async function getTournamentDetail(year: number): Promise<TournamentDetail | null> {
  try {
    const detail = await import(`@/data/tournaments/${year}.json`);
    return detail.default as TournamentDetail;
  } catch {
    return null;
  }
}

export function getAllChampions(): { year: number; champion: { teamId: string; nameZh: string; nameEn: string } }[] {
  return tournaments.map((t) => ({
    year: t.year,
    champion: t.champion,
  }));
}

export function getChampionsByTeam(teamId: string): number[] {
  return tournaments
    .filter((t) => t.champion.teamId === teamId)
    .map((t) => t.year);
}

export function getYearRange(): { earliest: number; latest: number } {
  return {
    earliest: tournaments[tournaments.length - 1]?.year ?? 1930,
    latest: tournaments[0]?.year ?? 2022,
  };
}
