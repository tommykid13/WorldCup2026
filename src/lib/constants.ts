export const SITE_CONFIG = {
  name: '2026 世界杯',
  nameEn: '2026 World Cup',
  description: '2026年世界杯专题网站 - 美国·加拿大·墨西哥',
  url: 'https://worldcup2026.example.com',
  tournamentStart: '2026-06-11T18:00:00-04:00',
  tournamentEnd: '2026-07-19T18:00:00-04:00',
  hostCountries: [
    { code: 'us', nameZh: '美国', nameEn: 'United States' },
    { code: 'ca', nameZh: '加拿大', nameEn: 'Canada' },
    { code: 'mx', nameZh: '墨西哥', nameEn: 'Mexico' },
  ],
  totalTeams: 48,
  totalGroups: 12,
  totalVenues: 16,
};

export const NAV_ITEMS = [
  { label: '首页', href: '/' },
  { label: '参赛球队', href: '/teams' },
  { label: '小组积分', href: '/groups' },
  { label: '赛程表', href: '/schedule' },
  { label: '射手榜', href: '/stats' },
  { label: '竞猜投票', href: '/vote' },
  { label: '淘汰赛', href: '/bracket' },
  { label: '历史回顾', href: '/history' },
  { label: '比赛场馆', href: '/venues' },
] as const;

export const POSITION_MAP: Record<string, string> = {
  GK: '门将',
  DF: '后卫',
  MF: '中场',
  FW: '前锋',
};

export const CONFEDERATION_MAP: Record<string, { nameZh: string; nameEn: string; color: string }> = {
  uefa: { nameZh: '欧洲足联', nameEn: 'UEFA', color: '#003399' },
  conmebol: { nameZh: '南美洲足联', nameEn: 'CONMEBOL', color: '#009B3A' },
  concacaf: { nameZh: '中北美洲足联', nameEn: 'CONCACAF', color: '#CC0000' },
  caf: { nameZh: '非洲足联', nameEn: 'CAF', color: '#FFD700' },
  afc: { nameZh: '亚洲足联', nameEn: 'AFC', color: '#ED1C24' },
  ofc: { nameZh: '大洋洲足联', nameEn: 'OFC', color: '#003DA5' },
};
