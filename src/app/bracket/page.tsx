import Image from 'next/image';
import type { Metadata } from 'next';
import scheduleData from '@/data/schedule/index.json';

export const metadata: Metadata = {
  title: '淘汰赛对阵图',
  description: '2026年世界杯淘汰赛阶段对阵图',
};

/* ===== SVG-based bracket with diagonal lines ===== */

const BOX_W = 160;
const BOX_H = 38;
const COL_GAP = 36;

const COL = {
  r16: 10,
  qf: 10 + BOX_W + COL_GAP,
  sf: 10 + (BOX_W + COL_GAP) * 2,
  final: 10 + (BOX_W + COL_GAP) * 3,
};

// Y positions — upper half
const R16_U = [10, 56, 130, 176];
const QF_U  = [(10 + 56) / 2, (130 + 176) / 2];
const SF_U  = [((10 + 56) / 2 + (130 + 176) / 2) / 2];

// Y positions — lower half
const DIV_Y = 228;
const R16_L = [DIV_Y + 16, DIV_Y + 62, DIV_Y + 136, DIV_Y + 182];
const QF_L  = [(R16_L[0] + R16_L[1]) / 2, (R16_L[2] + R16_L[3]) / 2];
const SF_L  = [(QF_L[0] + QF_L[1]) / 2];

const FINAL_Y = (SF_U[0] + SF_L[0]) / 2;
const THIRD_Y = FINAL_Y + 72;

const VB_W = COL.final + BOX_W + 20;
const VB_H = Math.max(THIRD_Y, R16_L[3]) + BOX_H + 20;

interface Match { id: string; top: string; bot: string; date: string; _status?: string; _homeScore?: number | null; _awayScore?: number | null }

type KoMatch = {
  id: string; home: string; away: string; date: string; time: string; venueZh: string;
  status?: string; homeScore?: number | null; awayScore?: number | null;
  homeTeam?: { id: string; nameZh: string; flagCode: string };
  awayTeam?: { id: string; nameZh: string; flagCode: string };
};

const _knockoutStage = (scheduleData as { knockoutStage: { round: string; roundEn: string; matches: KoMatch[] }[] }).knockoutStage;

function toMatch(m: KoMatch): Match {
  return {
    id: m.id,
    top: m.homeTeam ? m.homeTeam.nameZh : m.home,
    bot: m.awayTeam ? m.awayTeam.nameZh : m.away,
    date: m.date.slice(5).replace('-', '/').replace(/^0/, ''),
    _status: m.status,
    _homeScore: m.homeScore ?? undefined,
    _awayScore: m.awayScore ?? undefined,
  };
}

const R16_MATCHES: Match[] = _knockoutStage.find(r => r.roundEn === 'Round of 16')?.matches.map(toMatch) || [
  { id:'M89', top:'胜M73', bot:'胜M75', date:'7/5' },
  { id:'M90', top:'胜M74', bot:'胜M77', date:'7/5' },
  { id:'M91', top:'胜M76', bot:'胜M78', date:'7/6' },
  { id:'M92', top:'胜M79', bot:'胜M80', date:'7/6' },
  { id:'M93', top:'胜M83', bot:'胜M84', date:'7/7' },
  { id:'M94', top:'胜M81', bot:'胜M82', date:'7/7' },
  { id:'M95', top:'胜M86', bot:'胜M88', date:'7/8' },
  { id:'M96', top:'胜M85', bot:'胜M87', date:'7/8' },
];
const QF_MATCHES: Match[] = _knockoutStage.find(r => r.roundEn === 'Quarter-finals')?.matches.map(toMatch) || [
  { id:'M97', top:'胜M89', bot:'胜M90', date:'7/10' },
  { id:'M98', top:'胜M93', bot:'胜M94', date:'7/11' },
  { id:'M99', top:'胜M91', bot:'胜M92', date:'7/12' },
  { id:'M100', top:'胜M95', bot:'胜M96', date:'7/12' },
];
const SF_MATCHES: Match[] = _knockoutStage.find(r => r.roundEn === 'Semi-finals')?.matches.map(toMatch) || [
  { id:'M101', top:'胜M97', bot:'胜M98', date:'7/15' },
  { id:'M102', top:'胜M99', bot:'胜M100', date:'7/16' },
];

function Box({ x, y, top, bot, highlight, homeScore, awayScore }: { x: number; y: number; top: string; bot: string; highlight?: string; homeScore?: number | null; awayScore?: number | null }) {
  const stroke = highlight === 'gold' ? '#f59e0b' : highlight === 'gray' ? '#9ca3af' : '#d1d5db';
  const fill = highlight === 'gold' ? '#fffbeb' : highlight === 'gray' ? '#f9fafb' : '#ffffff';
  const hasScore = homeScore != null && awayScore != null;
  return (
    <g>
      <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={4} fill={fill} stroke={stroke} strokeWidth={highlight ? 2 : 1} />
      <line x1={x} y1={y + BOX_H / 2} x2={x + BOX_W} y2={y + BOX_H / 2} stroke="#e5e7eb" strokeWidth={1} />
      <text x={x + 6} y={y + 14} fontSize={11} fill="#1a1a2e" fontFamily="system-ui">{top}{hasScore ? ` ${homeScore}` : ''}</text>
      <text x={x + 6} y={y + BOX_H - 8} fontSize={11} fill="#1a1a2e" fontFamily="system-ui">{bot}{hasScore ? ` ${awayScore}` : ''}</text>
    </g>
  );
}

function Diag({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" />;
}

function RoundLabel({ x, label }: { x: number; label: string }) {
  return <text x={x + BOX_W / 2} y={VB_H - 6} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#6b7280" fontFamily="system-ui">{label}</text>;
}

export default function BracketPage() {
  const r32Round = _knockoutStage.find(r => r.roundEn === 'Round of 32');
  const r32Matches = r32Round ? r32Round.matches : [];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">淘汰赛对阵图</h1>
        <p className="text-muted mt-2">32支球队晋级淘汰赛，小组前两名（24支）及8支最佳第三名捉对厮杀</p>
      </div>

      <div className="mb-6 bg-white rounded-xl border border-border p-3 flex flex-wrap gap-3 text-xs">
        <span className="text-muted">图例：</span>
        <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-muted">A组首名</span><span className="text-muted">= 小组第1</span>
        <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-muted">A组次名</span><span className="text-muted">= 小组第2</span>
        <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-muted">X组第3</span><span className="text-muted">= 最佳第3名之一</span>
        <span className="ml-4 text-blue-500 font-bold">蓝色线 = 晋级路径</span>
        <span className="ml-2 text-muted">所有时间为北京时间</span>
      </div>

      {/* R32 Section */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-foreground mb-3">32强赛 <span className="text-xs text-muted font-normal">Round of 32 · 6/29–7/4 · 16场 · 北京时间</span></h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {r32Matches.map(m => {
            const completed = m.status === 'completed';
            const homeLabel = m.homeTeam ? (
              <div className="flex items-center gap-1">
                <Image src={`/flags/${m.homeTeam.flagCode}.png`} alt="" width={14} height={10} className="inline-block object-contain" unoptimized />
                <span>{m.homeTeam.nameZh}</span>
              </div>
            ) : m.home;
            const awayLabel = m.awayTeam ? (
              <div className="flex items-center gap-1">
                <Image src={`/flags/${m.awayTeam.flagCode}.png`} alt="" width={14} height={10} className="inline-block object-contain" unoptimized />
                <span>{m.awayTeam.nameZh}</span>
              </div>
            ) : m.away;
            return (
              <div key={m.id} className={`bg-white rounded-lg border border-border p-2 text-xs ${completed ? 'border-l-4 border-l-secondary' : ''}`}>
                <div className="flex justify-between text-muted mb-1"><span>{m.id}</span><span>{completed ? '已结束' : `${m.date.slice(5)} ${m.time}`}</span></div>
                <div className="flex items-center justify-between gap-1">
                  <div className="font-medium truncate">{homeLabel}</div>
                  {completed ? (
                    <span className="font-bold text-foreground shrink-0">{m.homeScore} - {m.awayScore}</span>
                  ) : (
                    <span className="text-muted shrink-0">vs</span>
                  )}
                  <div className="font-medium truncate">{awayLabel}</div>
                </div>
                <div className="text-muted mt-0.5 truncate">&#127967;{m.venueZh}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bracket Tree: R16 → Final */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4">16强赛 → 决赛 <span className="text-xs text-muted font-normal">7/5–7/20 · 北京时间</span></h2>

      <div className="bg-white rounded-xl border border-border p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full min-w-[760px]" style={{ maxHeight: '700px' }}>
          {/* Round labels at bottom */}
          <RoundLabel x={COL.r16} label="16强赛" />
          <RoundLabel x={COL.qf} label="四分之一决赛" />
          <RoundLabel x={COL.sf} label="半决赛" />
          <RoundLabel x={COL.final} label="决赛 / 季军" />

          {/* Divider */}
          <line x1={0} y1={DIV_Y} x2={COL.final + BOX_W} y2={DIV_Y} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="6 4" />
          <text x={COL.final + BOX_W + 6} y={DIV_Y + 4} fontSize={10} fill="#9ca3af" fontFamily="system-ui">分界线</text>

          {/* Half labels */}
          <text x={COL.r16 + BOX_W / 2} y={R16_U[0] - 2} textAnchor="middle" fontSize={10} fill="#9ca3af" fontFamily="system-ui">上半区</text>
          <text x={COL.r16 + BOX_W / 2} y={R16_L[0] - 2} textAnchor="middle" fontSize={10} fill="#9ca3af" fontFamily="system-ui">下半区</text>

          {/* ── Upper half R16 boxes ── */}
          {R16_U.map((y, i) => (
            <g key={`r16u${i}`}>
              <Box x={COL.r16} y={y} top={R16_MATCHES[i].top} bot={R16_MATCHES[i].bot} homeScore={R16_MATCHES[i]._homeScore} awayScore={R16_MATCHES[i]._awayScore} />
              <text x={COL.r16 + BOX_W / 2} y={y + BOX_H + 12} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="system-ui">{R16_MATCHES[i]._status ? `${R16_MATCHES[i]._homeScore}-${R16_MATCHES[i]._awayScore}` : R16_MATCHES[i].date}</text>
            </g>
          ))}

          {/* ── Upper half QF boxes ── */}
          {QF_U.map((y, i) => (
            <g key={`qfu${i}`}>
              <Box x={COL.qf} y={y} top={QF_MATCHES[i].top} bot={QF_MATCHES[i].bot} homeScore={QF_MATCHES[i]._homeScore} awayScore={QF_MATCHES[i]._awayScore} />
              <text x={COL.qf + BOX_W / 2} y={y + BOX_H + 12} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="system-ui">{QF_MATCHES[i]._status ? `${QF_MATCHES[i]._homeScore}-${QF_MATCHES[i]._awayScore}` : QF_MATCHES[i].date}</text>
            </g>
          ))}

          {/* ── Upper half SF box ── */}
          <Box x={COL.sf} y={SF_U[0]} top={SF_MATCHES[0].top} bot={SF_MATCHES[0].bot} homeScore={SF_MATCHES[0]._homeScore} awayScore={SF_MATCHES[0]._awayScore} />
          <text x={COL.sf + BOX_W / 2} y={SF_U[0] + BOX_H + 12} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="system-ui">{SF_MATCHES[0]._status ? `${SF_MATCHES[0]._homeScore}-${SF_MATCHES[0]._awayScore}` : SF_MATCHES[0].date}</text>

          {/* ── Lower half R16 boxes ── */}
          {R16_L.map((y, i) => (
            <g key={`r16l${i}`}>
              <Box x={COL.r16} y={y} top={R16_MATCHES[i + 4].top} bot={R16_MATCHES[i + 4].bot} homeScore={R16_MATCHES[i + 4]._homeScore} awayScore={R16_MATCHES[i + 4]._awayScore} />
              <text x={COL.r16 + BOX_W / 2} y={y + BOX_H + 12} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="system-ui">{R16_MATCHES[i + 4]._status ? `${R16_MATCHES[i + 4]._homeScore}-${R16_MATCHES[i + 4]._awayScore}` : R16_MATCHES[i + 4].date}</text>
            </g>
          ))}

          {/* ── Lower half QF boxes ── */}
          {QF_L.map((y, i) => (
            <g key={`qfl${i}`}>
              <Box x={COL.qf} y={y} top={QF_MATCHES[i + 2].top} bot={QF_MATCHES[i + 2].bot} homeScore={QF_MATCHES[i + 2]._homeScore} awayScore={QF_MATCHES[i + 2]._awayScore} />
              <text x={COL.qf + BOX_W / 2} y={y + BOX_H + 12} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="system-ui">{QF_MATCHES[i + 2]._status ? `${QF_MATCHES[i + 2]._homeScore}-${QF_MATCHES[i + 2]._awayScore}` : QF_MATCHES[i + 2].date}</text>
            </g>
          ))}

          {/* ── Lower half SF box ── */}
          <Box x={COL.sf} y={SF_L[0]} top={SF_MATCHES[1].top} bot={SF_MATCHES[1].bot} homeScore={SF_MATCHES[1]._homeScore} awayScore={SF_MATCHES[1]._awayScore} />
          <text x={COL.sf + BOX_W / 2} y={SF_L[0] + BOX_H + 12} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="system-ui">{SF_MATCHES[1]._status ? `${SF_MATCHES[1]._homeScore}-${SF_MATCHES[1]._awayScore}` : SF_MATCHES[1].date}</text>

          {/* ── Final & Third place ── */}
          <Box x={COL.final} y={FINAL_Y} top="胜半决赛1" bot="胜半决赛2" highlight="gold" />
          <text x={COL.final + BOX_W / 2} y={FINAL_Y - 6} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#f59e0b" fontFamily="system-ui">&#127942; 决赛</text>
          <text x={COL.final + BOX_W / 2} y={FINAL_Y + BOX_H + 12} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="system-ui">7/20 03:00 · 大都会人寿体育场</text>

          <Box x={COL.final} y={THIRD_Y} top="负半决赛1" bot="负半决赛2" highlight="gray" />
          <text x={COL.final + BOX_W / 2} y={THIRD_Y - 6} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#6b7280" fontFamily="system-ui">季军赛</text>
          <text x={COL.final + BOX_W / 2} y={THIRD_Y + BOX_H + 12} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="system-ui">7/19 05:00 · 硬石体育场</text>

          {/* ══════ DIAGONAL CONNECTING LINES (red) ══════ */}

          {/* Upper R16 → QF */}
          <Diag x1={COL.r16 + BOX_W} y1={R16_U[0] + BOX_H / 2} x2={COL.qf} y2={QF_U[0] + BOX_H / 2} />
          <Diag x1={COL.r16 + BOX_W} y1={R16_U[1] + BOX_H / 2} x2={COL.qf} y2={QF_U[0] + BOX_H / 2} />
          <Diag x1={COL.r16 + BOX_W} y1={R16_U[2] + BOX_H / 2} x2={COL.qf} y2={QF_U[1] + BOX_H / 2} />
          <Diag x1={COL.r16 + BOX_W} y1={R16_U[3] + BOX_H / 2} x2={COL.qf} y2={QF_U[1] + BOX_H / 2} />

          {/* Upper QF → SF */}
          <Diag x1={COL.qf + BOX_W} y1={QF_U[0] + BOX_H / 2} x2={COL.sf} y2={SF_U[0] + BOX_H / 2} />
          <Diag x1={COL.qf + BOX_W} y1={QF_U[1] + BOX_H / 2} x2={COL.sf} y2={SF_U[0] + BOX_H / 2} />

          {/* Lower R16 → QF */}
          <Diag x1={COL.r16 + BOX_W} y1={R16_L[0] + BOX_H / 2} x2={COL.qf} y2={QF_L[0] + BOX_H / 2} />
          <Diag x1={COL.r16 + BOX_W} y1={R16_L[1] + BOX_H / 2} x2={COL.qf} y2={QF_L[0] + BOX_H / 2} />
          <Diag x1={COL.r16 + BOX_W} y1={R16_L[2] + BOX_H / 2} x2={COL.qf} y2={QF_L[1] + BOX_H / 2} />
          <Diag x1={COL.r16 + BOX_W} y1={R16_L[3] + BOX_H / 2} x2={COL.qf} y2={QF_L[1] + BOX_H / 2} />

          {/* Lower QF → SF */}
          <Diag x1={COL.qf + BOX_W} y1={QF_L[0] + BOX_H / 2} x2={COL.sf} y2={SF_L[0] + BOX_H / 2} />
          <Diag x1={COL.qf + BOX_W} y1={QF_L[1] + BOX_H / 2} x2={COL.sf} y2={SF_L[0] + BOX_H / 2} />

          {/* SF → Final */}
          <Diag x1={COL.sf + BOX_W} y1={SF_U[0] + BOX_H / 2} x2={COL.final} y2={FINAL_Y + BOX_H / 2} />
          <Diag x1={COL.sf + BOX_W} y1={SF_L[0] + BOX_H / 2} x2={COL.final} y2={FINAL_Y + BOX_H / 2} />
        </svg>
      </div>

      </section>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
        <strong>说明：</strong>所有时间为北京时间（UTC+8）。第3名后标注的字母为可能来源的小组，最终对阵将在小组赛结束后确定。
      </div>
    </div>
  );
}
