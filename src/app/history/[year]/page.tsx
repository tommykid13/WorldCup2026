import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTournamentByYear, getAllTournaments } from '@/lib/data/tournaments';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const tournaments = getAllTournaments();
  return tournaments.map((t) => ({
    year: String(t.year),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const tournament = getTournamentByYear(Number(year));
  if (!tournament) return { title: '赛事未找到' };
  return {
    title: `${tournament.year} ${tournament.hostZh}世界杯`,
    description: `${tournament.year}年世界杯，举办地：${tournament.hostZh}，冠军：${tournament.champion.nameZh}`,
  };
}

export default async function TournamentYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const tournament = getTournamentByYear(Number(year));
  if (!tournament) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted">
        <Link href="/history" className="hover:text-primary transition-colors">
          历史回顾
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{tournament.year}</span>
      </nav>

      {/* Tournament Header */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{getFlagEmoji(tournament.hostCode)}</span>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {tournament.year} 年世界杯
            </h1>
            <p className="text-lg text-muted mt-1">
              举办地：{tournament.hostZh} ({tournament.hostEn})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{tournament.teamsCount}</div>
            <div className="text-sm text-muted">参赛球队</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{tournament.matchesCount ?? '—'}</div>
            <div className="text-sm text-muted">比赛场次</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{tournament.dates}</div>
            <div className="text-sm text-muted">比赛日期</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{tournament.topScorer.goals}</div>
            <div className="text-sm text-muted">金靴进球</div>
          </div>
        </div>
      </div>

      {/* Final Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { place: '冠军', team: tournament.champion, emoji: '🏆', variant: 'secondary' as const },
          { place: '亚军', team: tournament.runnerUp, emoji: '🥈', variant: 'default' as const },
          { place: '季军', team: tournament.thirdPlace, emoji: '🥉', variant: 'default' as const },
        ].map(({ place, team, emoji, variant }) => (
          <Card key={place} hover={false} className="p-5">
            <div className="text-center">
              <div className="text-4xl mb-2">{emoji}</div>
              <div className="text-sm text-muted mb-1">{place}</div>
              <div className="text-xl font-bold text-foreground">{team.nameZh}</div>
              <div className="text-sm text-muted">{team.nameEn}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Individual Awards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">个人奖项</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Golden Ball */}
          {tournament.goldenBall && (
            <Card hover={false} className="p-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚽</span>
                <div>
                  <div className="text-xs text-muted mb-1">金球奖 (最佳球员)</div>
                  <div className="font-semibold text-foreground">
                    {tournament.goldenBall.nameZh}
                  </div>
                  <Badge variant="primary" className="mt-1">
                    {tournament.goldenBall.teamId.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Golden Boot */}
          {tournament.topScorer && (
            <Card hover={false} className="p-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">👟</span>
                <div>
                  <div className="text-xs text-muted mb-1">金靴奖 (最佳射手)</div>
                  <div className="font-semibold text-foreground">
                    {tournament.topScorer.players[0]?.nameZh}
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    {tournament.topScorer.goals} 球
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Golden Glove */}
          {tournament.goldenGlove && (
            <Card hover={false} className="p-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🧤</span>
                <div>
                  <div className="text-xs text-muted mb-1">金手套奖 (最佳门将)</div>
                  <div className="font-semibold text-foreground">
                    {tournament.goldenGlove.nameZh}
                  </div>
                  <Badge variant="success" className="mt-1">
                    {tournament.goldenGlove.teamId.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Best Young Player */}
          {tournament.bestYoungPlayer && (
            <Card hover={false} className="p-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌟</span>
                <div>
                  <div className="text-xs text-muted mb-1">最佳新秀</div>
                  <div className="font-semibold text-foreground">
                    {tournament.bestYoungPlayer.nameZh}
                  </div>
                  <Badge variant="default" className="mt-1">
                    {tournament.bestYoungPlayer.teamId.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-border">
        {tournament.year > 1930 ? (
          <Link
            href={`/history/${tournament.year - (tournament.year === 1950 ? 12 : (tournament.year === 1946 ? 8 : 4))}`}
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            ← 上一届
          </Link>
        ) : (
          <span />
        )}
        {tournament.year < 2022 ? (
          <Link
            href={`/history/${tournament.year + (tournament.year === 1938 ? 12 : (tournament.year === 1934 ? 4 : 4))}`}
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            下一届 →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  if (countryCode === 'gb-eng') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (countryCode === 'gb-sct') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
