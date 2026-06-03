'use client';

import { useState } from 'react';
import { TeamGrid } from '@/components/teams/TeamGrid';
import { getAllTeams } from '@/lib/data/teams';
import { CONFEDERATION_MAP } from '@/lib/constants';

export default function TeamsPage() {
  const [filter, setFilter] = useState<string>('all');
  const allTeams = getAllTeams();

  const confederations = Object.entries(CONFEDERATION_MAP).map(([id, info]) => ({
    id,
    ...info,
    count: allTeams.filter((t) => t.confederation === id).length,
  }));

  const teams = filter === 'all' ? allTeams : allTeams.filter((t) => t.confederation === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">参赛球队</h1>
        <p className="text-muted mt-2">
          2026年世界杯首次扩军至48支球队，分为12个小组
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-muted-light text-muted hover:bg-gray-200'
          }`}
        >
          全部 ({allTeams.length})
        </button>
        {confederations.map((conf) => (
          <button
            key={conf.id}
            onClick={() => setFilter(conf.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === conf.id ? 'bg-primary text-white' : 'bg-muted-light text-muted hover:bg-gray-200'
            }`}
          >
            {conf.nameZh} ({conf.count})
          </button>
        ))}
      </div>

      <TeamGrid teams={teams} />
    </div>
  );
}
