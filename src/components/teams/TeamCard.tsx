import Link from 'next/link';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { TeamSummary } from '@/lib/types';
import { CONFEDERATION_MAP } from '@/lib/constants';

interface TeamCardProps { team: TeamSummary }

export function TeamCard({ team }: TeamCardProps) {
  const conf = CONFEDERATION_MAP[team.confederation];
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="p-4 h-full">
        <div className="flex items-center gap-3">
          <CountryFlag code={team.flagCode} size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{team.nameZh}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="primary">{conf?.nameZh ?? team.confederation}</Badge>
              <Badge variant="secondary">第 {team.group} 组</Badge>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{team.fifaRanking}</div>
            <div className="text-xs text-muted">世界排名</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{team.worldCupTitles}</div>
            <div className="text-xs text-muted">夺冠次数</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{team.worldCupAppearances}</div>
            <div className="text-xs text-muted">参赛次数</div>
          </div>
        </div>
        {team.worldCupTitles > 0 && (
          <div className="mt-3 pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-secondary">
              <span>&#127942;</span>
              <span>冠军年份：{team.worldCupTitleYears.join('、')}</span>
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}
