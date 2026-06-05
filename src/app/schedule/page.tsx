import Image from 'next/image';
import scheduleData from '@/data/schedule/index.json';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '赛程表',
  description: '2026年世界杯完整赛程安排',
};

type GroupMatch = {
  id: string; group: string; matchday: number; date: string; time: string;
  venueId: string; venueZh: string; status: string; homeScore: number | null; awayScore: number | null;
  homeTeam: { id: string; nameZh: string; flagCode: string };
  awayTeam: { id: string; nameZh: string; flagCode: string };
};
type KnockoutMatch = {
  id: string; home: string; away: string; date: string; time: string; venueZh: string;
  status?: string; homeScore?: number | null; awayScore?: number | null;
  homeTeam?: { id: string; nameZh: string; flagCode: string };
  awayTeam?: { id: string; nameZh: string; flagCode: string };
};
type KnockoutRound = { round: string; roundEn: string; matches: KnockoutMatch[] };

function formatDate(d: string) {
  const dt = new Date(d + 'T12:00:00');
  const wd = ['周日','周一','周二','周三','周四','周五','周六'];
  return `${dt.getMonth()+1}月${dt.getDate()}日 ${wd[dt.getDay()]}`;
}

function Team({ flagCode, nameZh }: { flagCode: string; nameZh: string }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Image src={`/flags/${flagCode}.png`} alt="" width={22} height={15} className="inline-block object-contain shrink-0" unoptimized />
      <span className="text-sm font-medium text-foreground truncate">{nameZh}</span>
    </div>
  );
}

function GroupMatchCard({ m }: { m: GroupMatch }) {
  const completed = m.status === 'completed';
  return (
    <div className={`bg-white rounded-lg border border-border shadow-sm overflow-hidden ${completed ? 'border-l-4 border-l-primary' : ''}`}>
      <div className="px-3 py-1.5 bg-muted-light/50 flex items-center justify-between text-xs text-muted">
        <span className="font-medium">{m.group} 组 · 第{m.matchday}轮</span>
        <span>{completed ? '已结束' : m.time}</span>
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <Team flagCode={m.homeTeam.flagCode} nameZh={m.homeTeam.nameZh} />
        {completed ? (
          <span className="text-sm font-bold text-foreground shrink-0 px-2">{m.homeScore} - {m.awayScore}</span>
        ) : (
          <span className="text-xs text-muted bg-muted-light px-2 py-0.5 rounded shrink-0">VS</span>
        )}
        <Team flagCode={m.awayTeam.flagCode} nameZh={m.awayTeam.nameZh} />
      </div>
      <div className="px-3 py-1 border-t border-border text-xs text-muted">&#127967; {m.venueZh}</div>
    </div>
  );
}

export default function SchedulePage() {
  const { groupStage, knockoutStage } = scheduleData as { groupStage: GroupMatch[]; knockoutStage: KnockoutRound[] };
  const byDate: Record<string, GroupMatch[]> = {};
  for (const m of groupStage) { if (!byDate[m.date]) byDate[m.date] = []; byDate[m.date].push(m); }
  const dates = Object.keys(byDate).sort();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">赛程表</h1>
        <p className="text-muted mt-2">2026年6月11日至7月19日，共104场比赛 · 所有时间为北京时间</p>
      </div>

      {/* 小组赛 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-primary rounded-full" />
          <div><h2 className="text-2xl font-bold text-foreground">小组赛</h2><p className="text-sm text-muted">6月11日 — 6月27日 · 72场</p></div>
        </div>
        <div className="space-y-8">
          {dates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-bold text-foreground">{formatDate(date)}</h3>
                <span className="text-xs text-muted">{byDate[date].length}场</span>
                <div className="flex-1 border-t border-border" />
              </div>
              <div className="space-y-3">
                {[0, 2].map((s) => {
                  const row = byDate[date].slice(s, s + 2);
                  if (!row.length) return null;
                  return (
                    <div key={s} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {row.map((m) => <GroupMatchCard key={m.id} m={m} />)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 淘汰赛 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-secondary rounded-full" />
          <div><h2 className="text-2xl font-bold text-foreground">淘汰赛</h2><p className="text-sm text-muted">6月28日 — 7月19日 · 32场</p></div>
        </div>
        <div className="space-y-8">
          {knockoutStage.map((round) => {
            const bd: Record<string, KnockoutMatch[]> = {};
            for (const m of round.matches) { if (!bd[m.date]) bd[m.date] = []; bd[m.date].push(m); }
            return (
              <div key={round.round}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-bold text-foreground">{round.round}</h3>
                  <span className="text-xs text-muted">{round.roundEn} · {round.matches.length}场</span>
                  <div className="flex-1 border-t border-border" />
                </div>
                {Object.keys(bd).sort().map((date) => (
                  <div key={date} className="mb-3">
                    <div className="text-xs text-muted mb-2">{formatDate(date)}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {bd[date].map((m) => {
                        const completed = m.status === 'completed';
                        const homeDisplay = m.homeTeam ? (
                          <Team flagCode={m.homeTeam.flagCode} nameZh={m.homeTeam.nameZh} />
                        ) : (
                          <span className="text-sm font-medium text-foreground truncate">{m.home}</span>
                        );
                        const awayDisplay = m.awayTeam ? (
                          <Team flagCode={m.awayTeam.flagCode} nameZh={m.awayTeam.nameZh} />
                        ) : (
                          <span className="text-sm font-medium text-foreground truncate">{m.away}</span>
                        );
                        return (
                          <div key={m.id} className={`bg-white rounded-lg border border-border shadow-sm overflow-hidden ${completed ? 'border-l-4 border-l-secondary' : ''}`}>
                            <div className="px-3 py-1 bg-muted-light/50 flex items-center justify-between text-xs text-muted">
                              <span>{completed ? '已结束' : m.time}</span><span>{m.id}</span>
                            </div>
                            <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                              {homeDisplay}
                              {completed ? (
                                <span className="text-sm font-bold text-foreground shrink-0 px-2">{m.homeScore} - {m.awayScore}</span>
                              ) : (
                                <span className="text-xs text-muted bg-muted-light px-2 py-0.5 rounded shrink-0">VS</span>
                              )}
                              {awayDisplay}
                            </div>
                            <div className="px-3 py-1 border-t border-border text-xs text-muted">&#127967; {m.venueZh}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
