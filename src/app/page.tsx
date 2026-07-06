import Link from 'next/link';
import Image from 'next/image';
import { HeroStage } from '@/components/home/HeroStage';
import { getAllVenues } from '@/lib/data/venues';
import { SITE_CONFIG } from '@/lib/constants';
import scheduleData from '@/data/schedule/index.json';

function FlagImg({ code, w = 28, h = 18 }: { code: string; w?: number; h?: number }) {
  return (
    <Image src={`/flags/${code}.png`} alt="" width={w} height={h} className="inline-block object-contain" unoptimized />
  );
}

type KoMatch = {
  id: string; home: string; away: string; date: string; time: string; venueZh: string;
  status?: string; homeScore?: number | null; awayScore?: number | null; winner?: 'home' | 'away';
  homeTeam?: { id: string; nameZh: string; flagCode: string };
  awayTeam?: { id: string; nameZh: string; flagCode: string };
};

type KnockoutRound = { round: string; roundEn: string; matches: KoMatch[] };
type DecoratedKoMatch = KoMatch & { round: string; roundEn: string };
type BracketNode = {
  id: string;
  match: DecoratedKoMatch;
  x: number;
  y: number;
  label?: string;
  tone?: 'default' | 'final' | 'third';
};

const BRACKET_CARD_W = 180;
const BRACKET_CARD_H = 92;
const BRACKET_COL_GAP = 36;
const BRACKET_ROW_GAP = 10;
const BRACKET_CANVAS_PAD = 28;
const BRACKET_THIRD_GAP = 36;
const BRACKET_CANVAS_W = 1080;
const BRACKET_CANVAS_H = 850;

function formatTeamRef(ref: string): string {
  const simple = ref.match(/^([1-4])([A-L])$/);
  if (simple) return `${simple[2]}组第${simple[1]}名`;

  if (ref.startsWith('3rd ')) return `最佳第3名 ${ref.slice(4)}`;

  const win = ref.match(/^胜(M?\d+)$/);
  if (win) return `${win[1]}胜者`;

  const lose = ref.match(/^负(M?\d+)$/);
  if (lose) return `${lose[1]}负者`;

  return ref;
}

function formatMatchDate(date: string): string {
  const [, month, day] = date.split('-');
  return `${Number(month)}月${Number(day)}日`;
}

function getStatusLabel(match: KoMatch): string {
  if (match.status === 'completed') return '已结束';
  if (match.homeTeam && match.awayTeam) return '待赛';
  return '待定';
}

function scoreLabel(match: KoMatch, side: 'home' | 'away'): string | null {
  const homeScore = match.homeScore;
  const awayScore = match.awayScore;
  if (homeScore == null || awayScore == null) return null;

  const score = side === 'home' ? homeScore : awayScore;
  const isPenaltyWinner =
    homeScore === awayScore &&
    ((side === 'home' && match.winner === 'home') || (side === 'away' && match.winner === 'away'));

  return `${score}${isPenaltyWinner ? '点' : ''}`;
}

function TeamLine({
  team,
  fallback,
  score,
  winner,
}: {
  team?: { nameZh: string; flagCode: string };
  fallback: string;
  score: string | null;
  winner: boolean;
}) {
  const label = team ? team.nameZh : formatTeamRef(fallback);

  return (
    <div className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 ${winner ? 'bg-primary-light/70' : ''}`}>
      <div className="flex items-center gap-2 min-w-0">
        {team ? (
          <Image
            src={`/flags/${team.flagCode}.png`}
            alt={`${team.nameZh}国旗`}
            width={22}
            height={15}
            className="inline-block object-contain shrink-0"
            unoptimized
          />
        ) : (
          <span className="inline-block h-[15px] w-[22px] rounded-sm border border-border bg-muted-light shrink-0" aria-hidden="true" />
        )}
        <span className={`truncate text-sm ${team ? 'font-medium text-foreground' : 'text-muted'}`}>{label}</span>
      </div>
      {score ? (
        <span className={`shrink-0 text-sm tabular-nums ${winner ? 'font-bold text-primary-dark' : 'font-semibold text-foreground'}`}>
          {score}
        </span>
      ) : null}
    </div>
  );
}

function KnockoutMatchCard({ match, compact = false }: { match: DecoratedKoMatch; compact?: boolean }) {
  const completed = match.status === 'completed';
  const homeScore = scoreLabel(match, 'home');
  const awayScore = scoreLabel(match, 'away');
  const homeWinner = completed && (match.winner === 'home' || ((match.homeScore ?? -1) > (match.awayScore ?? -1)));
  const awayWinner = completed && (match.winner === 'away' || ((match.awayScore ?? -1) > (match.homeScore ?? -1)));
  const isFinal = match.roundEn === 'Final';

  return (
    <article
      className={`rounded-lg border bg-white p-3 shadow-sm ${
        completed ? 'border-l-4 border-l-secondary' : isFinal ? 'border-secondary/50 bg-secondary-light/25' : 'border-border'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-muted">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono shrink-0">{match.id}</span>
          {!compact && <span className="truncate">{match.round}</span>}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
          completed ? 'bg-secondary-light text-amber-700' : match.homeTeam && match.awayTeam ? 'bg-primary-light text-primary-dark' : 'bg-gray-100 text-muted'
        }`}>
          {getStatusLabel(match)}
        </span>
      </div>

      <div className="space-y-1">
        <TeamLine team={match.homeTeam} fallback={match.home} score={homeScore} winner={homeWinner} />
        <TeamLine team={match.awayTeam} fallback={match.away} score={awayScore} winner={awayWinner} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2 text-[11px] text-muted">
        <span>{formatMatchDate(match.date)} {match.time}</span>
        {!compact && <span className="truncate text-right">{match.venueZh}</span>}
      </div>
    </article>
  );
}

function BracketTeamRow({
  team,
  fallback,
  score,
  winner,
  completed,
}: {
  team?: { nameZh: string; flagCode: string };
  fallback: string;
  score: string | null;
  winner: boolean;
  completed: boolean;
}) {
  const label = team ? team.nameZh : formatTeamRef(fallback);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {team ? (
          <Image
            src={`/flags/${team.flagCode}.png`}
            alt={`${team.nameZh}国旗`}
            width={22}
            height={15}
            className="h-[15px] w-[22px] rounded-sm object-contain shrink-0"
            unoptimized
          />
        ) : (
          <span className="h-[15px] w-[22px] rounded-sm border border-amber-200/40 bg-gradient-to-b from-amber-100 to-amber-300 opacity-80 shrink-0" aria-hidden="true" />
        )}
        <span className={`truncate text-xs font-semibold ${team ? 'text-white' : 'text-white/45'} ${completed && !winner ? 'text-white/55' : ''}`}>
          {team ? label : '待定'}
        </span>
      </div>
      <span className={`w-5 text-right text-xs tabular-nums ${winner ? 'font-bold text-white' : 'text-white/75'}`}>
        {score ?? '-'}
      </span>
    </div>
  );
}

function ConnectedBracketCard({ node }: { node: BracketNode }) {
  const { match, label, tone = 'default' } = node;
  const completed = match.status === 'completed';
  const homeScore = scoreLabel(match, 'home');
  const awayScore = scoreLabel(match, 'away');
  const homeWinner = completed && (match.winner === 'home' || ((match.homeScore ?? -1) > (match.awayScore ?? -1)));
  const awayWinner = completed && (match.winner === 'away' || ((match.awayScore ?? -1) > (match.homeScore ?? -1)));

  const toneClass = {
    default: 'border-white/20 bg-slate-950/42',
    final: 'border-amber-300/60 bg-slate-800/75 shadow-[0_0_0_1px_rgba(245,158,11,0.18),0_18px_45px_rgba(0,0,0,0.28)]',
    third: 'border-orange-200/45 bg-slate-800/55',
  }[tone];

  return (
    <div
      className="absolute"
      style={{ left: node.x, top: node.y, width: BRACKET_CARD_W, height: BRACKET_CARD_H }}
    >
      {label ? (
        <div className={`absolute -top-7 left-3 rounded-t-lg px-3 py-1 text-xs font-bold ${
          tone === 'final' ? 'bg-amber-100 text-slate-950' : 'bg-orange-200 text-slate-950'
        }`}>
          {label}
        </div>
      ) : null}
      <article className={`h-full rounded-xl border p-3 text-white backdrop-blur-sm ${toneClass}`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-white/90">{formatMatchDate(match.date)} {match.time}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
            completed ? 'bg-white/15 text-white' : 'bg-white/10 text-white/85'
          }`}>
            {completed ? '已结束' : '待开赛'}
          </span>
        </div>
        <div className="space-y-2.5">
          <BracketTeamRow team={match.homeTeam} fallback={match.home} score={homeScore} winner={homeWinner} completed={completed} />
          <BracketTeamRow team={match.awayTeam} fallback={match.away} score={awayScore} winner={awayWinner} completed={completed} />
        </div>
      </article>
    </div>
  );
}

function ConnectedBracket({
  roundOf16Matches,
  quarterFinalMatches,
  semiFinalMatches,
  finalMatch,
  thirdPlaceMatch,
}: {
  roundOf16Matches: DecoratedKoMatch[];
  quarterFinalMatches: DecoratedKoMatch[];
  semiFinalMatches: DecoratedKoMatch[];
  finalMatch?: DecoratedKoMatch;
  thirdPlaceMatch?: DecoratedKoMatch;
}) {
  const byId = new Map<string, DecoratedKoMatch>();
  for (const match of [...roundOf16Matches, ...quarterFinalMatches, ...semiFinalMatches, finalMatch, thirdPlaceMatch]) {
    if (match) byId.set(match.id, match);
  }

  const r16Order = ['M89', 'M90', 'M93', 'M94', 'M91', 'M92', 'M95', 'M96'];
  const qfOrder = ['M97', 'M98', 'M99', 'M100'];
  const sfOrder = ['M101', 'M102'];
  const columns = {
    r16: BRACKET_CANVAS_PAD,
    qf: BRACKET_CANVAS_PAD + BRACKET_CARD_W + BRACKET_COL_GAP,
    sf: BRACKET_CANVAS_PAD + (BRACKET_CARD_W + BRACKET_COL_GAP) * 2,
    final: BRACKET_CANVAS_PAD + (BRACKET_CARD_W + BRACKET_COL_GAP) * 3,
    third: BRACKET_CANVAS_PAD + (BRACKET_CARD_W + BRACKET_COL_GAP) * 3 + BRACKET_CARD_W + BRACKET_THIRD_GAP,
  };
  const r16Y = r16Order.map((_, index) => BRACKET_CANVAS_PAD + index * (BRACKET_CARD_H + BRACKET_ROW_GAP));
  const centerBetween = (firstY: number, secondY: number) => (firstY + BRACKET_CARD_H / 2 + secondY + BRACKET_CARD_H / 2) / 2 - BRACKET_CARD_H / 2;
  const qfY = [
    centerBetween(r16Y[0], r16Y[1]),
    centerBetween(r16Y[2], r16Y[3]),
    centerBetween(r16Y[4], r16Y[5]),
    centerBetween(r16Y[6], r16Y[7]),
  ];
  const sfY = [centerBetween(qfY[0], qfY[1]), centerBetween(qfY[2], qfY[3])];
  const finalY = centerBetween(sfY[0], sfY[1]);

  const nodes: BracketNode[] = [
    ...r16Order.flatMap((id, index) => {
      const match = byId.get(id);
      return match ? [{ id, match, x: columns.r16, y: r16Y[index] }] : [];
    }),
    ...qfOrder.flatMap((id, index) => {
      const match = byId.get(id);
      return match ? [{ id, match, x: columns.qf, y: qfY[index] }] : [];
    }),
    ...sfOrder.flatMap((id, index) => {
      const match = byId.get(id);
      return match ? [{ id, match, x: columns.sf, y: sfY[index] }] : [];
    }),
    ...(finalMatch ? [{ id: finalMatch.id, match: finalMatch, x: columns.final, y: finalY, label: '决赛', tone: 'final' as const }] : []),
    ...(thirdPlaceMatch ? [{ id: thirdPlaceMatch.id, match: thirdPlaceMatch, x: columns.third, y: finalY, label: '季军赛', tone: 'third' as const }] : []),
  ];

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const connectorPairs: Array<[string, string, 'default' | 'final' | 'third']> = [
    ['M89', 'M97', 'default'], ['M90', 'M97', 'default'],
    ['M93', 'M98', 'default'], ['M94', 'M98', 'default'],
    ['M91', 'M99', 'default'], ['M92', 'M99', 'default'],
    ['M95', 'M100', 'default'], ['M96', 'M100', 'default'],
    ['M97', 'M101', 'default'], ['M98', 'M101', 'default'],
    ['M99', 'M102', 'default'], ['M100', 'M102', 'default'],
    ['M101', 'M104', 'final'], ['M102', 'M104', 'final'],
    ['M101', 'M103', 'third'], ['M102', 'M103', 'third'],
  ];

  return (
    <div className="rounded-2xl bg-[#0b1938] p-3 sm:p-5 shadow-inner">
      <div className="max-w-full overflow-x-auto">
        <div
          className="relative"
          style={{ width: BRACKET_CANVAS_W, height: BRACKET_CANVAS_H }}
          aria-label="2026世界杯淘汰赛连线对阵图"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_12%,rgba(59,130,246,0.26),transparent_34%),linear-gradient(180deg,#1f3f87_0%,#0b1938_55%,#08142d_100%)]" />
          <svg
            viewBox={`0 0 ${BRACKET_CANVAS_W} ${BRACKET_CANVAS_H}`}
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {connectorPairs.map(([fromId, toId, tone]) => {
              const from = nodeMap.get(fromId);
              const to = nodeMap.get(toId);
              if (!from || !to) return null;

              const x1 = from.x + BRACKET_CARD_W;
              const y1 = from.y + BRACKET_CARD_H / 2;
              const x2 = to.x;
              const y2 = to.y + BRACKET_CARD_H / 2;
              const midX = x1 + (x2 - x1) / 2;
              const d = `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
              const stroke =
                tone === 'final'
                  ? 'rgba(245, 158, 11, 0.5)'
                  : tone === 'third'
                    ? 'rgba(251, 191, 36, 0.28)'
                    : 'rgba(148, 163, 184, 0.34)';

              return (
                <path
                  key={`${fromId}-${toId}`}
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={tone === 'final' ? 2 : 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0">
            {nodes.map((node) => (
              <ConnectedBracketCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function collectRound(round?: KnockoutRound): DecoratedKoMatch[] {
  if (!round) return [];
  return round.matches.map((match) => ({
    ...match,
    round: round.round,
    roundEn: round.roundEn,
  }));
}

export default function HomePage() {
  const venues = getAllVenues();
  const knockoutStage = (scheduleData as { knockoutStage: KnockoutRound[] }).knockoutStage;
  const knockoutMatches = knockoutStage.flatMap((round) => collectRound(round));
  const completedKnockoutMatches = knockoutMatches.filter((match) => match.status === 'completed');
  const remainingMatches = knockoutMatches.filter((match) => match.status !== 'completed');

  const roundOf16 = knockoutStage.find((round) => round.roundEn === 'Round of 16');
  const quarterFinals = knockoutStage.find((round) => round.roundEn === 'Quarter-finals');
  const semiFinals = knockoutStage.find((round) => round.roundEn === 'Semi-finals');
  const thirdPlace = knockoutStage.find((round) => round.roundEn === 'Third Place');
  const final = knockoutStage.find((round) => round.roundEn === 'Final');

  const roundOf16Matches = collectRound(roundOf16);
  const quarterFinalMatches = collectRound(quarterFinals);
  const semiFinalMatches = collectRound(semiFinals);
  const finalMatches = collectRound(final);
  const thirdPlaceMatches = collectRound(thirdPlace);

  const knockoutRows = [
    { label: '16强赛', note: 'Round of 16', matches: roundOf16Matches },
    { label: '8强赛', note: 'Quarter-finals', matches: quarterFinalMatches },
    { label: '4强赛 / 决赛', note: 'Semi-finals · Final & Third Place', matches: [...semiFinalMatches, ...finalMatches, ...thirdPlaceMatches] },
  ].filter((row) => row.matches.length > 0);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-emerald-600 to-emerald-800 text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            {SITE_CONFIG.hostCountries.map((c) => (
              <FlagImg key={c.code} code={c.code} w={48} h={32} />
            ))}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-3">2026 世界杯</h1>
          <p className="text-lg sm:text-xl text-white/80 mb-2">美国 · 加拿大 · 墨西哥</p>
          <p className="text-sm text-white/60 mb-10">2026年6月11日 — 7月19日</p>
          <div className="mb-4">
            <HeroStage />
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: String(SITE_CONFIG.totalTeams), label: '参赛球队' },
            { value: String(SITE_CONFIG.totalGroups), label: '小组分组' },
            { value: String(venues.length), label: '比赛场馆' },
            { value: '104', label: '比赛场次' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-border p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Knockout Bracket */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">淘汰赛对阵图</h2>
            <p className="text-sm text-muted mt-1">
              已完成 {completedKnockoutMatches.length} 场 · 剩余 {remainingMatches.length} 场 · 所有时间为北京时间
            </p>
          </div>
          <Link href="/bracket" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            完整对阵图 →
          </Link>
        </div>

        <div className="space-y-7">
          {knockoutRows.map((row) => (
            <div key={row.label} className="min-w-0">
              <div className="mb-3 flex items-center gap-3">
                <div>
                  <h3 className="font-bold text-foreground">{row.label}</h3>
                  <p className="text-xs text-muted">{row.note}</p>
                </div>
                <span className="rounded-full bg-muted-light px-2 py-1 text-xs text-muted">{row.matches.length} 场</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {row.matches.map((match) => (
                  <KnockoutMatchCard key={match.id} match={match} compact />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Connected Schedule */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">剩余赛程连线图</h2>
            <p className="text-sm text-muted mt-1">16强赛至决赛 · 晋级路径与比分 · 北京时间</p>
          </div>
          <Link href="/schedule" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            完整赛程 →
          </Link>
        </div>

        <ConnectedBracket
          roundOf16Matches={roundOf16Matches}
          quarterFinalMatches={quarterFinalMatches}
          semiFinalMatches={semiFinalMatches}
          finalMatch={finalMatches[0]}
          thirdPlaceMatch={thirdPlaceMatches[0]}
        />
      </section>

      {/* Venues */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">比赛场馆</h2>
            <p className="text-sm text-muted mt-1">横跨三个国家的16座世界级场馆</p>
          </div>
          <Link href="/venues" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">查看全部 →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {venues.slice(0, 3).map((venue) => (
            <div key={venue.id} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <FlagImg code={venue.country} w={32} h={20} />
                <div>
                  <h3 className="font-semibold text-foreground">{venue.nameZh}</h3>
                  <p className="text-xs text-muted">{venue.cityZh}，{venue.countryZh}</p>
                </div>
              </div>
              <p className="text-sm text-muted line-clamp-2">{venue.descriptionZh}</p>
              <div className="mt-3 text-xs text-muted">容量：{venue.capacity.toLocaleString()} 人</div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl border border-border p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">免责声明</h2>
          <div className="text-sm text-muted leading-relaxed space-y-3">
            <p>本网站为独立运营的足球资讯平台，与 FIFA（国际足球联合会）、国际足联世界杯（FIFA World Cup）、2026年世界杯赛事组织机构、参赛球队、足球协会、联赛、转播机构、赞助商及其关联方不存在任何隶属、授权、合作、认可或官方关联关系。</p>
            <p>本网站所提供的赛程、比赛结果、积分榜、球队资料、球员资料、球场资料、排名及统计数据，仅供信息参考和足球资讯交流使用。</p>
            <p>本网站所提及的商标、服务标志、队名、赛事名称、品牌名称及其他知识产权，均归其各自权利人所有。</p>
            <p>除法律允许或已获得授权的内容外，本网站不提供、不复制、不传播任何受版权保护的官方比赛视频、直播信号、赛事转播内容、官方摄影作品、官方宣传图片、官方海报、官方标识（Logo）或其他专有媒体内容。</p>
            <p>如任何权利人认为本网站内容可能侵犯其合法权益，请通过网站提供的联系方式与我们联系。我们将在收到通知后及时核实并采取必要措施。</p>
            <p>使用本网站即表示您理解并同意，本网站所提供的信息不构成任何官方声明、保证或承诺。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
