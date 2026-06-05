import Image from 'next/image';
import type { Metadata } from 'next';
import statsData from '@/data/stats.json';

type ScorerEntry = {
  rank: number; name: string; teamId: string; teamNameZh: string; flagCode: string;
  goals: number; assists: number; penalties: number; appearances: number;
};
type AssistEntry = {
  rank: number; name: string; teamId: string; teamNameZh: string; flagCode: string;
  assists: number; goals: number; keyPasses: number; appearances: number;
};

export const metadata: Metadata = {
  title: '射手榜 & 助攻榜',
  description: '2026年世界杯射手榜与助攻榜',
};

const scorers: ScorerEntry[] = statsData.scorers || [];
const assists: AssistEntry[] = statsData.assists || [];
const summary = statsData.summary || { totalGoals: 0, totalAssists: 0, avgGoalsPerMatch: 0, hatTricks: 0 };

function RankBadge({ rank, type }: { rank: number; type: 'scorer' | 'assist' }) {
  const styles = type === 'scorer'
    ? rank === 1 ? 'bg-yellow-400 text-yellow-900' : rank === 2 ? 'bg-gray-300 text-gray-700' : rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-muted'
    : rank === 1 ? 'bg-blue-400 text-white' : rank === 2 ? 'bg-gray-300 text-gray-700' : rank === 3 ? 'bg-sky-600 text-white' : 'bg-gray-100 text-muted';
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${styles}`}>
      {rank}
    </span>
  );
}

export default function StatsPage() {
  const hasData = scorers.length > 0 || assists.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">射手榜 & 助攻榜</h1>
        <p className="text-muted mt-2">
          {hasData ? '数据随比赛进展更新' : '比赛开始后数据将实时更新'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Scorers */}
        <div>
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-secondary to-amber-500 text-white px-5 py-4 flex items-center gap-3">
              <span className="text-2xl">&#9917;</span>
              <div>
                <h2 className="text-lg font-bold">射手榜</h2>
                <p className="text-xs text-white/80">Golden Boot / 最佳射手</p>
              </div>
            </div>

            <div className="p-6">
              {!hasData && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">&#128202;</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">等待比赛开始</h3>
                  <p className="text-sm text-muted max-w-xs mx-auto">
                    世界杯小组赛于2026年6月11日开赛后，射手榜数据将在此处实时更新
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted-light text-muted text-xs">
                      <th className="px-3 py-2 text-center w-10">排名</th>
                      <th className="px-3 py-2 text-left">球员</th>
                      <th className="px-3 py-2 text-left">球队</th>
                      <th className="px-3 py-2 text-center">出场</th>
                      <th className="px-3 py-2 text-center font-bold">进球</th>
                      <th className="px-3 py-2 text-center">助攻</th>
                      <th className="px-3 py-2 text-center">点球</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(hasData ? scorers : [1, 2, 3, 4, 5]).map((item, idx) => {
                      if (typeof item === 'number') {
                        return (
                          <tr key={item} className="border-t border-border">
                            <td className="px-3 py-3 text-center"><RankBadge rank={item} type="scorer" /></td>
                            <td className="px-3 py-3 text-muted">-</td>
                            <td className="px-3 py-3 text-muted">-</td>
                            <td className="px-3 py-3 text-center text-muted">0</td>
                            <td className="px-3 py-3 text-center font-bold text-muted">0</td>
                            <td className="px-3 py-3 text-center text-muted">0</td>
                            <td className="px-3 py-3 text-center text-muted">0</td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={`${item.teamId}-${item.name}`} className="border-t border-border">
                          <td className="px-3 py-3 text-center"><RankBadge rank={item.rank} type="scorer" /></td>
                          <td className="px-3 py-3 font-medium text-foreground">{item.name}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <Image src={`/flags/${item.flagCode}.png`} alt="" width={18} height={12} className="inline-block object-contain" unoptimized />
                              <span>{item.teamNameZh}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-muted">{item.appearances}</td>
                          <td className="px-3 py-3 text-center font-bold text-foreground">{item.goals}</td>
                          <td className="px-3 py-3 text-center text-muted">{item.assists}</td>
                          <td className="px-3 py-3 text-center text-muted">{item.penalties}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Assists */}
        <div>
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-accent to-blue-500 text-white px-5 py-4 flex items-center gap-3">
              <span className="text-2xl">&#127919;</span>
              <div>
                <h2 className="text-lg font-bold">助攻榜</h2>
                <p className="text-xs text-white/80">Playmaker Award / 最佳助攻</p>
              </div>
            </div>

            <div className="p-6">
              {!hasData && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">&#128202;</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">等待比赛开始</h3>
                  <p className="text-sm text-muted max-w-xs mx-auto">
                    世界杯小组赛于2026年6月11日开赛后，助攻榜数据将在此处实时更新
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted-light text-muted text-xs">
                      <th className="px-3 py-2 text-center w-10">排名</th>
                      <th className="px-3 py-2 text-left">球员</th>
                      <th className="px-3 py-2 text-left">球队</th>
                      <th className="px-3 py-2 text-center">出场</th>
                      <th className="px-3 py-2 text-center font-bold">助攻</th>
                      <th className="px-3 py-2 text-center">进球</th>
                      <th className="px-3 py-2 text-center">关键传球</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(hasData ? assists : [1, 2, 3, 4, 5]).map((item, idx) => {
                      if (typeof item === 'number') {
                        return (
                          <tr key={item} className="border-t border-border">
                            <td className="px-3 py-3 text-center"><RankBadge rank={item} type="assist" /></td>
                            <td className="px-3 py-3 text-muted">-</td>
                            <td className="px-3 py-3 text-muted">-</td>
                            <td className="px-3 py-3 text-center text-muted">0</td>
                            <td className="px-3 py-3 text-center font-bold text-muted">0</td>
                            <td className="px-3 py-3 text-center text-muted">0</td>
                            <td className="px-3 py-3 text-center text-muted">0</td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={`${item.teamId}-${item.name}`} className="border-t border-border">
                          <td className="px-3 py-3 text-center"><RankBadge rank={item.rank} type="assist" /></td>
                          <td className="px-3 py-3 font-medium text-foreground">{item.name}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <Image src={`/flags/${item.flagCode}.png`} alt="" width={18} height={12} className="inline-block object-contain" unoptimized />
                              <span>{item.teamNameZh}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-muted">{item.appearances}</td>
                          <td className="px-3 py-3 text-center font-bold text-foreground">{item.assists}</td>
                          <td className="px-3 py-3 text-center text-muted">{item.goals}</td>
                          <td className="px-3 py-3 text-center text-muted">{item.keyPasses}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '总进球', value: String(summary.totalGoals), icon: '\u26BD' },
          { label: '总助攻', value: String(summary.totalAssists), icon: '\uD83C\uDFF1' },
          { label: '场均进球', value: summary.avgGoalsPerMatch.toFixed(2), icon: '\uD83D\uDCC8' },
          { label: '帽子戏法', value: String(summary.hatTricks), icon: '\uD83C\uDFC6' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-border p-4 text-center"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
