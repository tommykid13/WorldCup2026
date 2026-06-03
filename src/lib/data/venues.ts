import type { Venue } from '@/lib/types';
import venuesData from '@/data/venues/index.json';

const venues: Venue[] = venuesData.venues;

export function getAllVenues(): Venue[] {
  return venues;
}

export function getVenueById(id: string): Venue | undefined {
  return venues.find((v) => v.id === id);
}

export function getVenuesByCountry(country: string): Venue[] {
  return venues.filter((v) => v.country === country);
}
