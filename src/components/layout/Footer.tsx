import Link from 'next/link';
import { NAV_ITEMS, SITE_CONFIG } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-foreground text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚽</span>
              <div>
                <h3 className="font-bold text-lg">{SITE_CONFIG.name}</h3>
                <p className="text-sm text-gray-400">美国 · 加拿大 · 墨西哥</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              2026年世界杯专题网站，提供赛事信息、球队介绍、历史回顾等内容。
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">网站导航</h4>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Host Countries */}
          <div>
            <h4 className="font-semibold mb-4">举办国</h4>
            <div className="space-y-2">
              {SITE_CONFIG.hostCountries.map((country) => (
                <div key={country.code} className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{getFlagEmoji(country.code)}</span>
                  <span>{country.nameZh}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© 2026 World Cup Fan Site. 本站为球迷自发制作，非官方站点。</p>
        </div>
      </div>
    </footer>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
