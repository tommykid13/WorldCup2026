import Image from 'next/image';
import { getAllTeams } from '@/lib/data/teams';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '小组积分榜',
  description: '2026年世界杯12个小组积分榜',
};

export default function GroupsPage() {
  const teams = getAllTeams();
  const groups: Record<string, typeof teams> = {};
  for (const team of teams) {
    if (!groups[team.group]) groups[team.group] = [];
    groups[team.group].push(team);
  }
  const groupNames = Object.keys(groups).sort();
  const rows: string[][] = [];
  for (let i = 0; i < groupNames.length; i += 2) {
    rows.push(groupNames.slice(i, i + 2));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">小组积分榜</h1>
        <p className="text-muted mt-2">48支球队分为12个小组，每组前两名及8支最佳第三名晋级淘汰赛阶段</p>
      </div>
      <div className="space-y-6">
        {rows.map((row, ri) => (
          <div key={ri}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {row.map((gn) => {
                const gt = groups[gn].sort((a, b) => a.fifaRanking - b.fifaRanking);
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
                        </tr>
                      </thead>
                      <tbody>
                        {gt.map((team, i) => (
                          <tr key={team.id} className={`border-t border-border ${i < 2 ? 'bg-emerald-50/50' : ''}`}>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${i === 0 ? 'bg-primary text-white' : i === 1 ? 'bg-emerald-100 text-primary' : 'bg-gray-100 text-muted'}`}>
                                {i + 1}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <Image src={`/flags/${team.flagCode}.png`} alt="" width={24} height={16} className="inline-block object-contain shrink-0" unoptimized />
                                <span className="font-medium text-foreground">{team.nameZh}</span>
                              </div>
                            </td>
                            <td className="px-2 py-2.5 text-center text-muted">0</td>
                            <td className="px-2 py-2.5 text-center text-muted">0</td>
                            <td className="px-2 py-2.5 text-center text-muted">0</td>
                            <td className="px-2 py-2.5 text-center text-muted">0</td>
                            <td className="px-2 py-2.5 text-center text-muted">0</td>
                            <td className="px-2 py-2.5 text-center text-muted">0</td>
                            <td className="px-3 py-2.5 text-center font-bold text-foreground">0</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-4 py-2 bg-muted-light/50 text-xs text-muted border-t border-border">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1" />前两名直接晋级
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-300 ml-3 mr-1" />争夺最佳第三名
                    </div>
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
