'use client';

import { useState, useEffect } from 'react';
import { SITE_CONFIG } from '@/lib/constants';
import { CountdownTimer } from './CountdownTimer';
import { TodayMatches } from './TodayMatches';

export function HeroStage() {
  const [mounted, setMounted] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    setLive(Date.now() >= new Date(SITE_CONFIG.tournamentStart).getTime());
    setMounted(true);
  }, []);

  // SSR: show CountdownTimer loading state (--), no label → avoids flash
  if (!mounted) {
    return <CountdownTimer />;
  }

  if (live) {
    return (
      <>
        <p className="text-sm text-white/70 mb-4">今日赛况</p>
        <TodayMatches />
      </>
    );
  }

  return (
    <>
      <p className="text-sm text-white/70 mb-4">距离开幕还有</p>
      <CountdownTimer />
    </>
  );
}
