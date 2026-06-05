'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type Team = { id: string; nameZh: string; flagCode: string; fifaRanking: number };
type VoteData = { champion: Record<string, number>; runnerup: Record<string, number>; semifinal: Record<string, number> };
type TabKey = 'champion' | 'runnerup' | 'semifinal';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'champion', label: '冠军' },
  { key: 'runnerup', label: '亚军' },
  { key: 'semifinal', label: '四强' },
];

export function VotePanel({ teams }: { teams: Team[] }) {
  const [tab, setTab] = useState<TabKey>('champion');
  const [votes, setVotes] = useState<VoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<Record<TabKey, string | null>>({ champion: null, runnerup: null, semifinal: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const prev = { champion: null, runnerup: null, semifinal: null } as Record<TabKey, string | null>;
    for (const t of TABS) {
      const v = localStorage.getItem(`wc2026_${t.key}`);
      if (v) prev[t.key] = v;
    }
    setVoted(prev);

    fetch('/api/vote')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setVotes(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleVote(teamId: string) {
    if (voted[tab] || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: tab, teamId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setVotes(data);
      setVoted((prev) => ({ ...prev, [tab]: teamId }));
      localStorage.setItem(`wc2026_${tab}`, teamId);
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  }

  const cat = votes?.[tab] || {};
  const total = Object.values(cat).reduce((a, b) => a + b, 0);
  const max = Math.max(...Object.values(cat), 1);

  const sorted = [...teams].sort((a, b) => {
    const va = cat[a.id] || 0;
    const vb = cat[b.id] || 0;
    if (va !== vb) return vb - va;
    return a.fifaRanking - b.fifaRanking;
  });

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="h-11 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-primary text-white' : 'bg-white border border-border text-muted hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {total > 0 && (
        <p className="text-sm text-muted mb-4">
          共 {total.toLocaleString()} 票{voted[tab] ? ' · 你已投票' : ''}
        </p>
      )}

      <div className="space-y-1">
        {sorted.map((team) => {
          const count = cat[team.id] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const barW = count > 0 ? (count / max) * 100 : 0;
          const isMine = voted[tab] === team.id;
          const done = !!voted[tab];

          return (
            <div
              key={team.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isMine ? 'bg-emerald-50 border border-primary/30' : 'hover:bg-gray-50'
              }`}
            >
              <Image
                src={`/flags/${team.flagCode}.png`}
                alt=""
                width={22}
                height={15}
                className="object-contain flex-shrink-0"
                unoptimized
              />
              <span className="text-sm font-medium text-foreground min-w-[3.5em]">{team.nameZh}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isMine ? 'bg-primary' : 'bg-primary/30'}`}
                  style={{ width: `${barW}%` }}
                />
              </div>
              <span className="text-xs text-muted tabular-nums w-8 text-right">{count || '-'}</span>
              {total > 0 && (
                <span className="text-[11px] text-muted tabular-nums w-11 text-right hidden sm:block">
                  {pct.toFixed(1)}%
                </span>
              )}
              <div className="w-12 text-right flex-shrink-0">
                {isMine ? (
                  <span className="text-xs text-primary font-medium">已投</span>
                ) : (
                  !done && (
                    <button
                      onClick={() => handleVote(team.id)}
                      disabled={submitting}
                      className="px-2 py-0.5 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      投票
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
