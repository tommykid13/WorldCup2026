'use client';

import { useState, useEffect } from 'react';
import { SITE_CONFIG } from '@/lib/constants';

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(SITE_CONFIG.tournamentStart).getTime();

    function update() {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-3 justify-center">
        {['天', '时', '分', '秒'].map((label) => (
          <div key={label} className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[70px]">
              --
            </div>
            <div className="text-xs text-white/70 mt-1">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: '天' },
    { value: timeLeft.hours, label: '时' },
    { value: timeLeft.minutes, label: '分' },
    { value: timeLeft.seconds, label: '秒' },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="text-3xl sm:text-4xl font-bold text-white bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[70px] tabular-nums">
            {String(unit.value).padStart(2, '0')}
          </div>
          <div className="text-xs text-white/70 mt-1">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}
