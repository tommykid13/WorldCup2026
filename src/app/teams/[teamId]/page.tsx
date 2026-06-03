import { notFound } from 'next/navigation';
import { getTeamById, getTeamDetail, getAllTeams } from '@/lib/data/teams';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CONFEDERATION_MAP, POSITION_MAP } from '@/lib/constants';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const teams = getAllTeams();
  return teams.map((t) => ({ teamId: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamId: string }>;
}): Promise<Metadata> {
  const { teamId } = await params;
  const team = getTeamById(teamId);
  if (!team) return { title: '球队未找到' };
  return {
    title: `${team.nameZh} ${team.nameEn}`,
    description: team.descriptionZh,
  };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const team = getTeamById(teamId);
  if (!team) notFound();

  const detail = await getTeamDetail(teamId);
  const conf = CONFEDERATION_MAP[team.confederation];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Team Header */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-4">
          <CountryFlag code={team.flagCode} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{team.nameZh}</h1>
              <span className="text-lg text-muted">{team.nameEn}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="primary">{conf?.nameZh}</Badge>
              <Badge variant="secondary">第 {team.group} 组</Badge>
              <Badge variant="default">世界排名 #{team.fifaRanking}</Badge>
            </div>
            <p className="text-muted leading-relaxed">{team.descriptionZh}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: '世界杯参赛', value: `${team.worldCupAppearances} 次` },
            { label: '夺冠次数', value: `${team.worldCupTitles} 次` },
            { label: '最佳成绩', value: team.bestResult },
            { label: '主教练', value: team.coach.nameZh },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-muted">{stat.label}</div>
              <div className="text-lg font-semibold text-foreground mt-1">{stat.value}</div>
            </div>
          ))}
        </div>

        {team.worldCupTitles > 0 && (
          <div className="mt-4 flex items-center gap-2 text-secondary">
            <span className="text-xl">🏆</span>
            <span className="text-sm font-medium">
              冠军年份：{team.worldCupTitleYears.join('、')}
            </span>
          </div>
        )}
      </div>

      {/* Squad */}
      {detail?.squad && detail.squad.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            球队阵容
            <span className="text-sm font-normal text-muted ml-2">
              {detail.squad.length} 名球员
            </span>
          </h2>

          {(['GK', 'DF', 'MF', 'FW'] as const).map((position) => {
            const players = detail.squad.filter((p) => p.position === position);
            if (players.length === 0) return null;

            return (
              <div key={position} className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {position}
                  </span>
                  {POSITION_MAP[position]}
                  <span className="text-sm text-muted">({players.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {players.map((player) => (
                    <Card key={player.id} hover={false} className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-primary w-10 text-center">
                          {player.number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {player.nameZh}
                          </div>
                          <div className="text-xs text-muted truncate">{player.nameEn}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                        <span>{player.club.nameZh}</span>
                        <span>·</span>
                        <span>{player.caps} 场 / {player.goals} 球</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted">
          <p className="text-lg">阵容信息即将更新</p>
          <p className="text-sm mt-2">各队26人名单将在赛前公布</p>
        </div>
      )}
    </div>
  );
}
