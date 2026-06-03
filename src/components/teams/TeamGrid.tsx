import { TeamCard } from './TeamCard';
import type { TeamSummary } from '@/lib/types';

interface TeamGridProps {
  teams: TeamSummary[];
}

export function TeamGrid({ teams }: TeamGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
