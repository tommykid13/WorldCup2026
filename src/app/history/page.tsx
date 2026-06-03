import Link from 'next/link';
import Image from 'next/image';
import { getAllTournaments } from '@/lib/data/tournaments';
import { getAllAwards } from '@/lib/data/awards';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '历史回顾',
  description: '历届世界杯回顾，从1930年乌拉圭到2022年卡塔尔',
};

// Map tournament hostCode to flag file code(s)
const HOST_FLAG: Record<string, string[]> = {
  uru: ['uy'], ita: ['it'], fra: ['fr'], bra: ['br'],
  sui: ['ch'], swe: ['se'], chi: ['cl'], eng: ['gb-eng'],
  mex: ['mx'], frg: ['de'], arg: ['ar'], esp: ['es'],
  usa: ['us'], kor: ['kr', 'jp'], ger: ['de'],
  rsa: ['za'], rus: ['ru'], qat: ['qa'],
};

function HostFlag({ code }: { code: string }) {
  const flags = HOST_FLAG[code];
  if (!flags) return null;
  return (
    <span className="flex items-center gap-1 shrink-0">
      {flags.map((f, i) => (
        <Image key={i} src={`/flags/${f}.png`} alt="" width={36} height={24} className="inline-block object-contain" unoptimized />
      ))}
    </span>
  );
}

export default function HistoryPage() {
  const tournaments = getAllTournaments();
  const awards = getAllAwards();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">历史回顾</h1>
        <p className="text-muted mt-2">从1930年首届世界杯至今，22届赛事见证了无数经典时刻</p>
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">历届冠军</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tournaments.map((t) => (
            <Link key={t.year} href={`/history/${t.year}`}>
              <Card className="p-5 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <HostFlag code={t.hostCode} />
                  <div>
                    <div className="text-lg font-bold text-foreground">{t.year}</div>
                    <div className="text-xs text-muted">{t.hostZh}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary text-lg">&#127942;</span>
                    <span className="font-medium text-foreground">{t.champion.nameZh}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted">
                    <span>&#129352;</span>
                    <span>{t.runnerUp.nameZh}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted">
                    <span>&#129353;</span>
                    <span>{t.thirdPlace.nameZh}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">个人荣誉</h2>
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>&#128095;</span> 金靴奖 — 最佳射手
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted">年份</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">球员</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">球队</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">进球</th>
                </tr>
              </thead>
              <tbody>
                {awards.goldenBoot.winners.map((w) => (
                  <tr key={w.year} className="border-b border-border/50 hover:bg-muted-light/50">
                    <td className="py-3 px-4 font-medium">{w.year}</td>
                    <td className="py-3 px-4">{w.players[0]?.nameZh}</td>
                    <td className="py-3 px-4"><Badge variant="default">{w.players[0]?.teamNameZh}</Badge></td>
                    <td className="py-3 px-4 text-right font-bold text-secondary">{w.players[0]?.goals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>&#9917;</span> 金球奖 — 最佳球员
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted">年份</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">球员</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">球队</th>
                </tr>
              </thead>
              <tbody>
                {awards.goldenBall.winners.map((w) => (
                  <tr key={w.year} className="border-b border-border/50 hover:bg-muted-light/50">
                    <td className="py-3 px-4 font-medium">{w.year}</td>
                    <td className="py-3 px-4">{w.players[0]?.nameZh}</td>
                    <td className="py-3 px-4"><Badge variant="primary">{w.players[0]?.teamNameZh}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>&#129504;</span> 金手套奖 — 最佳门将
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted">年份</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">球员</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">球队</th>
                </tr>
              </thead>
              <tbody>
                {awards.goldenGlove.winners.map((w) => (
                  <tr key={w.year} className="border-b border-border/50 hover:bg-muted-light/50">
                    <td className="py-3 px-4 font-medium">{w.year}</td>
                    <td className="py-3 px-4">{w.players[0]?.nameZh}</td>
                    <td className="py-3 px-4"><Badge variant="success">{w.players[0]?.teamNameZh}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
