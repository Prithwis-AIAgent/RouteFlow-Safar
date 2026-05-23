import { Stop } from '@/types';

/**
 * Builds a Google Maps directions URL from an ordered list of stops.
 * - 2 stops: origin + destination (no waypoints)
 * - 3+ stops: origin + middle waypoints + destination
 */
export function buildMapsUrl(stops: Stop[]): string {
  if (stops.length < 2) return '';

  const encode = (addr: string) => encodeURIComponent(addr);

  const origin = encode(stops[0].address);
  const destination = encode(stops[stops.length - 1].address);

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

  if (stops.length > 2) {
    const waypoints = stops
      .slice(1, -1)
      .map((s) => encode(s.address))
      .join('|');
    url += `&waypoints=${waypoints}`;
  }

  // Force browser mode on mobile - prevents auto-redirect to Maps app
  url += '&force_browser=1';

  return url;
}

/**
 * Opens the route URL.
 * Always opens in a new tab (forces mobile browsers to open the web version of Google Maps instead of redirecting to the app).
 */
export function launchRoute(stops: Stop[]): void {
  const url = buildMapsUrl(stops);
  if (!url) return;

  // Open in new tab — forces browser mode and prevents automatic app redirection on mobile
  window.open(url, '_blank', 'noopener,noreferrer');
}
