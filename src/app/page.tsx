import Link from 'next/link';
import Image from 'next/image';
import { HeroStage } from '@/components/home/HeroStage';
import { getAllTeams } from '@/lib/data/teams';
import { getAllVenues } from '@/lib/data/venues';
import { SITE_CONFIG } from '@/lib/constants';
import standingsData from '@/data/standings.json';

type StandingEntry = {
  teamId: string; nameZh: string; flagCode: string; group: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; gd: number; points: number;
};

function FlagImg({ code, w = 28, h = 18 }: { code: string; w?: number; h?: number }) {
  return (
    <Image src={`/flags/${code}.png`} alt="" width={w} height={h} className="inline-block object-contain" unoptimized />
  );
}

export default function HomePage() {
  const teams = getAllTeams();
  const venues = getAllVenues();
  const hasStandings = Object.values(standingsData).some((g: StandingEntry[]) => g.some(s => s.played > 0));

  const groupNames = 'ABCDEFGHIJKL'.split('');
  const groups: Record<string, StandingEntry[]> = {};
  for (const g of groupNames) {
    if (hasStandings) {
      groups[g] = (standingsData as Record<string, StandingEntry[]>)[g] || [];
    } else {
      const gTeams = teams.filter(t => t.group === g).sort((a, b) => a.fifaRanking - b.fifaRanking);
      groups[g] = gTeams.map(t => ({
        teamId: t.id, nameZh: t.nameZh, flagCode: t.flagCode, group: t.group,
        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0,
      }));
    }
  }
  const rows: string[][] = [];
  for (let i = 0; i < groupNames.length; i += 2) {
    rows.push(groupNames.slice(i, i + 2));
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-emerald-600 to-emerald-800 text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            {SITE_CONFIG.hostCountries.map((c) => (
              <FlagImg key={c.code} code={c.code} w={48} h={32} />
            ))}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-3">2026 世界杯</h1>
          <p className="text-lg sm:text-xl text-white/80 mb-2">美国 · 加拿大 · 墨西哥</p>
          <p className="text-sm text-white/60 mb-10">2026年6月11日 — 7月19日</p>
          <div className="mb-4">
            <HeroStage />
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: String(SITE_CONFIG.totalTeams), label: '参赛球队' },
            { value: String(SITE_CONFIG.totalGroups), label: '小组分组' },
            { value: String(venues.length), label: '比赛场馆' },
            { value: '104', label: '比赛场次' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-border p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 小组积分 */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">小组积分榜</h2>
            <p className="text-sm text-muted mt-1">12个小组 · 前2名直接晋级 + 8支最佳第3名</p>
          </div>
          <Link href="/groups" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            查看详情 →
          </Link>
        </div>
        <div className="space-y-6">
          {rows.map((row, ri) => (
            <div key={ri}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {row.map((gn) => {
                  const gt = groups[gn];
                  return (
                    <div key={gn} className="bg-white rounded-xl border border-border overflow-hidden">
                      <div className="bg-gradient-to-r from-primary to-emerald-600 text-white px-4 py-2 flex items-center justify-between">
                        <span className="font-bold">{gn} 组</span>
                        <span className="text-xs text-white/70">GROUP {gn}</span>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted-light text-muted text-xs">
                            <th className="px-2 py-1.5 text-center w-6">#</th>
                            <th className="px-2 py-1.5 text-left">球队</th>
                            <th className="px-2 py-1.5 text-center">赛</th>
                            <th className="px-2 py-1.5 text-center">胜</th>
                            <th className="px-2 py-1.5 text-center">平</th>
                            <th className="px-2 py-1.5 text-center">负</th>
                            <th className="px-2 py-1.5 text-center">净胜</th>
                            <th className="px-2 py-1.5 text-center font-bold">积分</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gt.map((entry, i) => (
                            <tr key={entry.teamId} className={`border-t border-border ${i < 2 ? 'bg-emerald-50/50' : ''}`}>
                              <td className="px-2 py-1.5 text-center">
                                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${i === 0 ? 'bg-primary text-white' : i === 1 ? 'bg-emerald-100 text-primary' : 'bg-gray-100 text-muted'}`}>
                                  {i + 1}
                                </span>
                              </td>
                              <td className="px-2 py-1.5">
                                <div className="flex items-center gap-1.5">
                                  <Image src={`/flags/${entry.flagCode}.png`} alt="" width={20} height={14} className="inline-block object-contain" unoptimized />
                                  <span className="font-medium text-foreground text-xs">{entry.nameZh}</span>
                                </div>
                              </td>
                              <td className={`px-2 py-1.5 text-center text-xs ${entry.played ? 'text-foreground' : 'text-muted'}`}>{entry.played}</td>
                              <td className={`px-2 py-1.5 text-center text-xs ${entry.won ? 'text-foreground' : 'text-muted'}`}>{entry.won}</td>
                              <td className={`px-2 py-1.5 text-center text-xs ${entry.drawn ? 'text-foreground' : 'text-muted'}`}>{entry.drawn}</td>
                              <td className={`px-2 py-1.5 text-center text-xs ${entry.lost ? 'text-foreground' : 'text-muted'}`}>{entry.lost}</td>
                              <td className={`px-2 py-1.5 text-center text-xs ${entry.gd > 0 ? 'text-green-600 font-medium' : entry.gd < 0 ? 'text-red-500' : 'text-muted'}`}>{entry.gd > 0 ? '+' : ''}{entry.gd}</td>
                              <td className="px-2 py-1.5 text-center font-bold text-foreground text-xs">{entry.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
              {ri < rows.length - 1 && <div className="border-b border-border my-6" />}
            </div>
          ))}
        </div>
      </section>

      {/* Venues */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">比赛场馆</h2>
            <p className="text-sm text-muted mt-1">横跨三个国家的16座世界级场馆</p>
          </div>
          <Link href="/venues" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">查看全部 →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {venues.slice(0, 3).map((venue) => (
            <div key={venue.id} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <FlagImg code={venue.country} w={32} h={20} />
                <div>
                  <h3 className="font-semibold text-foreground">{venue.nameZh}</h3>
                  <p className="text-xs text-muted">{venue.cityZh}，{venue.countryZh}</p>
                </div>
              </div>
              <p className="text-sm text-muted line-clamp-2">{venue.descriptionZh}</p>
              <div className="mt-3 text-xs text-muted">容量：{venue.capacity.toLocaleString()} 人</div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl border border-border p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">免责声明</h2>
          <div className="text-sm text-muted leading-relaxed space-y-3">
            <p>本网站为独立运营的足球资讯平台，与 FIFA（国际足球联合会）、国际足联世界杯（FIFA World Cup）、2026年世界杯赛事组织机构、参赛球队、足球协会、联赛、转播机构、赞助商及其关联方不存在任何隶属、授权、合作、认可或官方关联关系。</p>
            <p>本网站所提供的赛程、比赛结果、积分榜、球队资料、球员资料、球场资料、排名及统计数据，仅供信息参考和足球资讯交流使用。</p>
            <p>本网站所提及的商标、服务标志、队名、赛事名称、品牌名称及其他知识产权，均归其各自权利人所有。</p>
            <p>除法律允许或已获得授权的内容外，本网站不提供、不复制、不传播任何受版权保护的官方比赛视频、直播信号、赛事转播内容、官方摄影作品、官方宣传图片、官方海报、官方标识（Logo）或其他专有媒体内容。</p>
            <p>如任何权利人认为本网站内容可能侵犯其合法权益，请通过网站提供的联系方式与我们联系。我们将在收到通知后及时核实并采取必要措施。</p>
            <p>使用本网站即表示您理解并同意，本网站所提供的信息不构成任何官方声明、保证或承诺。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
