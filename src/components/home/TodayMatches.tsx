'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import scheduleData from '@/data/schedule/index.json';

interface DisplayMatch {
  id: string;
  date: string;
  time: string;
  venueZh: string;
  homeName: string;
  homeFlag?: string;
  awayName: string;
  awayFlag?: string;
  completed: boolean;
  homeScore: number | null;
  awayScore: number | null;
  label: string;
}

function formatTeamRef(ref: string): string {
  const m = ref.match(/^([1-4])([A-L])$/);
  if (m) return `${m[2]}组第${m[1]}名`;
  return ref;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const allMatches: DisplayMatch[] = [
  ...(scheduleData as any).groupStage.map((m: any) => ({
    id: m.id,
    date: m.date,
    time: m.time,
    venueZh: m.venueZh,
    homeName: m.homeTeam.nameZh,
    homeFlag: m.homeTeam.flagCode,
    awayName: m.awayTeam.nameZh,
    awayFlag: m.awayTeam.flagCode,
    completed: m.status === 'completed',
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    label: m.group ? `${m.group}组` : '',
  })),
  ...(scheduleData as any).knockoutStage.flatMap((round: any) =>
    round.matches.map((m: any) => ({
      id: m.id,
      date: m.date,
      time: m.time,
      venueZh: m.venueZh,
      homeName: formatTeamRef(m.home),
      homeFlag: undefined,
      awayName: formatTeamRef(m.away),
      awayFlag: undefined,
      completed: false,
      homeScore: null,
      awayScore: null,
      label: round.round,
    }))
  ),
];

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function TodayMatches() {
  const [todayStr, setTodayStr] = useState('');

  useEffect(() => {
    setTodayStr(getTodayStr());
  }, []);

  if (!todayStr) {
    return <div className="h-20" />;
  }

  const matches = allMatches
    .filter((m) => m.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  if (matches.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-white/70">今天没有比赛</p>
        <a href="/schedule" className="text-xs text-white/50 hover:text-white/80 mt-2 inline-block transition-colors">
          查看完整赛程
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-2">
      {matches.map((match) => (
        <div key={match.id} className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Home */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-white text-sm font-medium">{match.homeName}</span>
              {match.homeFlag ? (
                <Image src={`/flags/${match.homeFlag}.png`} alt="" width={28} height={18} className="object-contain" unoptimized />
              ) : (
                <div className="w-7 h-[18px] rounded-sm bg-white/20" />
              )}
            </div>
            {/* Score / Time */}
            <div className="mx-2 text-center min-w-[56px]">
              {match.completed ? (
                <span className="text-white font-bold tabular-nums">{match.homeScore}-{match.awayScore}</span>
              ) : (
                <span className="text-white/60 text-sm font-mono">{match.time}</span>
              )}
            </div>
            {/* Away */}
            <div className="flex items-center gap-2 flex-1">
              {match.awayFlag ? (
                <Image src={`/flags/${match.awayFlag}.png`} alt="" width={28} height={18} className="object-contain" unoptimized />
              ) : (
                <div className="w-7 h-[18px] rounded-sm bg-white/20" />
              )}
              <span className="text-white text-sm font-medium">{match.awayName}</span>
            </div>
          </div>
          <div className="text-center mt-1.5">
            <span className="text-[11px] text-white/40">
              {match.venueZh}{match.label ? ` · ${match.label}` : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
