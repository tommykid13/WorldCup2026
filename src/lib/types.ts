// ===== Confederation =====
export interface Confederation {
  id: string;
  nameZh: string;
  nameEn: string;
  slots2026: number;
  color: string;
}

// ===== Team =====
export interface TeamSummary {
  id: string;
  nameZh: string;
  nameEn: string;
  flagCode: string;
  confederation: string;
  fifaRanking: number;
  worldCupAppearances: number;
  worldCupTitles: number;
  worldCupTitleYears: number[];
  bestResult: string;
  group: string;
  coach: CoachInfo;
  descriptionZh: string;
  descriptionEn: string;
  slug: string;
}

export interface CoachInfo {
  nameZh: string;
  nameEn: string;
}

export interface TeamDetail extends TeamSummary {
  squad: Player[];
  keyPlayers: string[];
  recentForm?: string[];
}

// ===== Player =====
export interface Player {
  id: string;
  nameZh: string;
  nameEn: string;
  number: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  positionZh: string;
  dateOfBirth: string;
  club: ClubInfo;
  caps: number;
  goals: number;
  height?: number;
  image?: string;
  descriptionZh?: string;
}

export interface ClubInfo {
  nameZh: string;
  nameEn: string;
  country?: string;
}

// ===== Tournament =====
export interface TournamentSummary {
  year: number;
  hostZh: string;
  hostEn: string;
  hostCode: string;
  champion: TournamentTeamResult;
  runnerUp: TournamentTeamResult;
  thirdPlace: TournamentTeamResult;
  teamsCount: number;
  matchesCount?: number;
  topScorer: TopScorerInfo;
  goldenBall: AwardWinner;
  goldenGlove: AwardWinner;
  bestYoungPlayer?: AwardWinner;
  dates: string;
  slug: string;
}

export interface TournamentTeamResult {
  teamId: string;
  nameZh: string;
  nameEn: string;
}

export interface TopScorerInfo {
  players: { nameZh: string; nameEn: string; teamId: string }[];
  goals: number;
}

export interface AwardWinner {
  nameZh: string;
  nameEn: string;
  teamId: string;
}

export interface TournamentDetail extends TournamentSummary {
  dates: string;
  venues: VenueInfo[];
  final?: FinalInfo;
  awards: TournamentAwards;
}

export interface VenueInfo {
  nameZh: string;
  nameEn: string;
  cityZh: string;
  cityEn: string;
}

export interface FinalInfo {
  date: string;
  score: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homePenScore?: number;
  awayPenScore?: number;
  venue: string;
}

export interface TournamentAwards {
  champion: string;
  runnerUp: string;
  thirdPlace: string;
  fourthPlace?: string;
  goldenBall: { playerId: string; teamId: string };
  goldenBoot: { playerId: string; teamId: string; goals: number };
  goldenGlove: { playerId: string; teamId: string };
  bestYoungPlayer?: { playerId: string; teamId: string };
}

// ===== Awards =====
export interface AwardData {
  award: {
    id: string;
    nameZh: string;
    nameEn: string;
    descriptionZh: string;
    descriptionEn: string;
  };
  winners: AwardWinnerEntry[];
}

export interface AwardWinnerEntry {
  year: number;
  players: {
    nameZh: string;
    nameEn: string;
    teamId: string;
    teamNameZh: string;
    teamNameEn: string;
    goals?: number;
    assists?: number;
  }[];
}

// ===== Venue =====
export interface Venue {
  id: string;
  nameZh: string;
  nameEn: string;
  cityZh: string;
  cityEn: string;
  country: string;
  countryZh: string;
  capacity: number;
  built: number;
  descriptionZh: string;
  descriptionEn: string;
  image?: string;
  matches?: string[];
  slug: string;
}

// ===== Match (Phase 3) =====
export interface Match {
  id: string;
  matchday: number;
  group?: string;
  date: string;
  venueId: string;
  homeTeam: string;
  awayTeam: string;
  status: 'upcoming' | 'live' | 'completed';
  score: {
    home: number | null;
    away: number | null;
    homePen?: number | null;
    awayPen?: number | null;
  };
  events: MatchEvent[];
}

export interface MatchEvent {
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty';
  minute: number;
  player: string;
  team: string;
  detail?: string;
}
