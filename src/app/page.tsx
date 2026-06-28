import Link from 'next/link';
import Image from 'next/image';
import { HeroStage } from '@/components/home/HeroStage';
import { getAllVenues } from '@/lib/data/venues';
import { SITE_CONFIG } from '@/lib/constants';
import scheduleData from '@/data/schedule/index.json';

function FlagImg({ code, w = 28, h = 18 }: { code: string; w?: number; h?: number }) {
  return (
    <Image src={`/flags/${code}.png`} alt="" width={w} height={h} className="inline-block object-contain" unoptimized />
  );
}

type KoMatch = {
  id: string; home: string; away: string; date: string; time: string; venueZh: string;
  status?: string; homeScore?: number | null; awayScore?: number | null;
  homeTeam?: { id: string; nameZh: string; flagCode: string };
  awayTeam?: { id: string; nameZh: string; flagCode: string };
};

export default function HomePage() {
  const venues = getAllVenues();

  // 取出 32 强赛对阵 (M73-M88)
  const knockoutStage = (scheduleData as { knockoutStage: { round: string; roundEn: string; matches: KoMatch[] }[] }).knockoutStage;
  const r32Round = knockoutStage.find(r => r.roundEn === 'Round of 32');
  const r32Matches: KoMatch[] = r32Round ? r32Round.matches : [];
  const hasR32 = r32Matches.some(m => m.homeTeam && m.awayTeam);

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

      {/* 32强对阵 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">32强对阵</h2>
            <p className="text-sm text-muted mt-1">小组赛结束 · 32支球队进入淘汰赛 · {hasR32 ? `${r32Matches.length}场对阵已确定` : '对阵待定'}</p>
          </div>
          <Link href="/bracket" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            完整对阵图 →
          </Link>
        </div>
        {hasR32 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {r32Matches.map(m => {
              const completed = m.status === 'completed';
              return (
                <div key={m.id} className={`bg-white rounded-lg border border-border p-3 ${completed ? 'border-l-4 border-l-secondary' : ''}`}>
                  <div className="flex justify-between text-[11px] text-muted mb-2">
                    <span className="font-mono">{m.id}</span>
                    <span>{completed ? '已结束' : `${m.date.slice(5).replace('-', '/')} ${m.time}`}</span>
                  </div>
                  {/* Home */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {m.homeTeam ? (
                        <Image src={`/flags/${m.homeTeam.flagCode}.png`} alt="" width={18} height={12} className="inline-block object-contain shrink-0" unoptimized />
                      ) : null}
                      <span className="font-medium text-foreground text-sm truncate">{m.homeTeam ? m.homeTeam.nameZh : m.home}</span>
                    </div>
                    {completed ? <span className="font-bold text-foreground text-sm shrink-0 tabular-nums">{m.homeScore}</span> : null}
                  </div>
                  {/* Away */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {m.awayTeam ? (
                        <Image src={`/flags/${m.awayTeam.flagCode}.png`} alt="" width={18} height={12} className="inline-block object-contain shrink-0" unoptimized />
                      ) : null}
                      <span className="font-medium text-foreground text-sm truncate">{m.awayTeam ? m.awayTeam.nameZh : m.away}</span>
                    </div>
                    {completed ? <span className="font-bold text-foreground text-sm shrink-0 tabular-nums">{m.awayScore}</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <p className="text-muted">淘汰赛对阵将在小组赛结束后确定</p>
            <Link href="/bracket" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors mt-2 inline-block">查看完整对阵图 →</Link>
          </div>
        )}
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
