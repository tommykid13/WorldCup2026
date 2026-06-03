import { getAllVenues } from '@/lib/data/venues';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '比赛场馆',
  description: '2026年世界杯16座比赛场馆一览',
};

export default function VenuesPage() {
  const venues = getAllVenues();

  const countries = [
    { code: 'us', name: '美国' },
    { code: 'ca', name: '加拿大' },
    { code: 'mx', name: '墨西哥' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">比赛场馆</h1>
        <p className="text-muted mt-2">
          横跨美国、加拿大、墨西哥三国的16座世界级体育场馆
        </p>
      </div>

      {countries.map((country) => {
        const countryVenues = venues.filter((v) => v.country === country.code);
        if (countryVenues.length === 0) return null;

        return (
          <section key={country.code} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{getFlagEmoji(country.code)}</span>
              <h2 className="text-2xl font-bold text-foreground">{country.name}</h2>
              <Badge variant="default">{countryVenues.length} 座场馆</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {countryVenues.map((venue) => (
                <Card key={venue.id} className="overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
                    <h3 className="text-lg font-bold text-foreground">{venue.nameZh}</h3>
                    <p className="text-sm text-muted">{venue.nameEn}</p>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-muted">📍</span>
                      <span className="text-sm">{venue.cityZh}，{venue.countryZh}</span>
                    </div>
                    <p className="text-sm text-muted mb-4 line-clamp-3">
                      {venue.descriptionZh}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted">
                        容量：<span className="font-medium text-foreground">{venue.capacity.toLocaleString()}</span> 人
                      </div>
                      <div className="text-muted">
                        建成：<span className="font-medium text-foreground">{venue.built}</span>
                      </div>
                    </div>
                    {venue.matches && venue.matches.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        {venue.matches.map((match) => (
                          <Badge key={match} variant="secondary" className="mr-1">
                            {match === 'final' ? '决赛' : match}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
