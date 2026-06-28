import Image from 'next/image';
import { getAllTeams } from '@/lib/data/teams';
import standingsData from '@/data/standings.json';
import type { Metadata } from 'next';

type StandingEntry = {
  teamId: string; nameZh: string; flagCode: string; group: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; gd: number; points: number;
};

// 晋级状态: 第1/2名直接晋级, 第3名需对比各组的第3名取前8
type AdvanceStatus = 'first' | 'second' | 'third-advance' | 'third-out' | 'fourth';

/**
 * 计算 8 支最佳第3名 (与 update-data.js 排序规则一致)。
 * 只在小组赛已打完时返回有意义的结果。
 */
function computeBestThirds(standings: Record<string, StandingEntry[]>): Set<string> {
  const thirds: StandingEntry[] = [];
  const groupNames = 'ABCDEFGHIJKL'.split('');
  for (const g of groupNames) {
    const arr = standings[g];
    if (arr && arr.length >= 3 && arr[2].played > 0) thirds.push(arr[2]);
  }
  // 排序: 积分 → 净胜球 → 进球 → teamId (稳定排序)
  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.teamId.localeCompare(b.teamId);
  });
  return new Set(thirds.slice(0, 8).map(t => t.teamId));
}

export const metadata: Metadata = {
  title: '小组积分榜',
  description: '2026年世界杯12个小组积分榜',
};

export default function GroupsPage() {
  const teams = getAllTeams();
  const hasStandings = Object.values(standingsData).some((g: StandingEntry[]) => g.some(s => s.played > 0));

  const groups: Record<string, StandingEntry[]> = {};
  const groupNames = 'ABCDEFGHIJKL'.split('');

  for (const g of groupNames) {
    if (hasStandings) {
      groups[g] = (standingsData as Record<string, StandingEntry[]>)[g] || [];
    } else {
      // fallback: 按 FIFA 排名排列，全部显示 0
      const gTeams = teams.filter(t => t.group === g).sort((a, b) => a.fifaRanking - b.fifaRanking);
      groups[g] = gTeams.map(t => ({
        teamId: t.id, nameZh: t.nameZh, flagCode: t.flagCode, group: t.group,
        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0,
      }));
    }
  }

  // 计算 8 支最佳第3名 (仅当小组赛全部打完时才有意义)
  const bestThirds = hasStandings ? computeBestThirds(groups) : new Set<string>();

  // 为每行计算晋级状态
  function getAdvanceStatus(entry: StandingEntry, index: number): AdvanceStatus {
    if (index === 0) return 'first';
    if (index === 1) return 'second';
    if (index === 2) return bestThirds.has(entry.teamId) ? 'third-advance' : 'third-out';
    return 'fourth';
  }

  const rows: string[][] = [];
  for (let i = 0; i < groupNames.length; i += 2) {
    rows.push(groupNames.slice(i, i + 2));
  }

  // 晋级状态 → 行样式 / 徽章
  const STATUS_STYLES: Record<AdvanceStatus, { row: string; badge: string; label: string }> = {
    'first':         { row: 'bg-emerald-50/60',   badge: 'bg-primary text-white',           label: '晋级' },
    'second':        { row: 'bg-emerald-50/30',   badge: 'bg-emerald-100 text-primary',      label: '晋级' },
    'third-advance': { row: 'bg-amber-50/50',     badge: 'bg-secondary text-white',          label: '最佳第3' },
    'third-out':     { row: '',                   badge: 'bg-red-100 text-red-600',          label: '淘汰' },
    'fourth':        { row: 'opacity-60',         badge: 'bg-gray-100 text-muted',           label: '淘汰' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">小组积分榜</h1>
        <p className="text-muted mt-2">48支球队分为12个小组，每组前两名及8支最佳第三名晋级淘汰赛阶段</p>
      </div>

      {/* 图例 */}
      <div className="mb-6 flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-muted">小组第1/2 直接晋级</span></span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary" /><span className="text-muted">最佳第3名晋级 (8支)</span></span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400" /><span className="text-muted">淘汰</span></span>
      </div>

      <div className="space-y-6">
        {rows.map((row, ri) => (
          <div key={ri}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {row.map((gn) => {
                const gt = groups[gn];
                return (
                  <div key={gn} className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-primary to-emerald-600 text-white px-4 py-3 flex items-center justify-between">
                      <span className="text-lg font-bold">{gn} 组</span>
                      <span className="text-xs text-white/70">GROUP {gn}</span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted-light text-muted text-xs">
                          <th className="px-3 py-2 text-center w-8">#</th>
                          <th className="px-3 py-2 text-left">球队</th>
                          <th className="px-2 py-2 text-center">赛</th>
                          <th className="px-2 py-2 text-center">胜</th>
                          <th className="px-2 py-2 text-center">平</th>
                          <th className="px-2 py-2 text-center">负</th>
                          <th className="px-2 py-2 text-center">进球</th>
                          <th className="px-2 py-2 text-center">净胜</th>
                          <th className="px-3 py-2 text-center font-bold">积分</th>
                          <th className="px-3 py-2 text-center w-14">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gt.map((entry, i) => {
                          const status = getAdvanceStatus(entry, i);
                          const st = STATUS_STYLES[status];
                          return (
                            <tr key={entry.teamId} className={`border-t border-border ${st.row}`}>
                              <td className="px-3 py-2.5 text-center">
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${i === 0 ? 'bg-primary text-white' : i === 1 ? 'bg-emerald-100 text-primary' : 'bg-gray-100 text-muted'}`}>
                                  {i + 1}
                                </span>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <Image src={`/flags/${entry.flagCode}.png`} alt="" width={24} height={16} className="inline-block object-contain shrink-0" unoptimized />
                                  <span className="font-medium text-foreground">{entry.nameZh}</span>
                                </div>
                              </td>
                              <td className={`px-2 py-2.5 text-center ${entry.played ? 'text-foreground' : 'text-muted'}`}>{entry.played}</td>
                              <td className={`px-2 py-2.5 text-center ${entry.won ? 'text-foreground' : 'text-muted'}`}>{entry.won}</td>
                              <td className={`px-2 py-2.5 text-center ${entry.drawn ? 'text-foreground' : 'text-muted'}`}>{entry.drawn}</td>
                              <td className={`px-2 py-2.5 text-center ${entry.lost ? 'text-foreground' : 'text-muted'}`}>{entry.lost}</td>
                              <td className={`px-2 py-2.5 text-center ${entry.gf ? 'text-foreground' : 'text-muted'}`}>{entry.gf}</td>
                              <td className={`px-2 py-2.5 text-center ${entry.gd > 0 ? 'text-green-600 font-medium' : entry.gd < 0 ? 'text-red-500' : 'text-muted'}`}>{entry.gd > 0 ? '+' : ''}{entry.gd}</td>
                              <td className="px-3 py-2.5 text-center font-bold text-foreground">{entry.points}</td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${st.badge}`}>{st.label}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
            {ri < rows.length - 1 && <div className="border-b border-border my-6" />}
          </div>
        ))}
      </div>
    </div>
  );
}
