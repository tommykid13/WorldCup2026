import { getAllTeams } from '@/lib/data/teams';
import { VotePanel } from './VotePanel';

export default function VotePage() {
  const teams = getAllTeams().map((t) => ({
    id: t.id,
    nameZh: t.nameZh,
    flagCode: t.flagCode,
    fifaRanking: t.fifaRanking,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">竞猜投票</h1>
        <p className="text-sm text-muted mt-1">选出你心中的冠军、亚军和四强球队，每人每个类别限投一票</p>
      </div>
      <VotePanel teams={teams} />
    </div>
  );
}
