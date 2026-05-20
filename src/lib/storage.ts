import { Route } from '@/types';

const ROUTES_KEY = 'routeflow_routes';

export function getLocalRoutes(): Route[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(ROUTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLocalRoute(route: Route): void {
  if (typeof window === 'undefined') return;
  const routes = getLocalRoutes();
  const idx = routes.findIndex((r) => r.id === route.id);
  if (idx >= 0) {
    routes[idx] = { ...route, updated_at: new Date().toISOString() };
  } else {
    routes.unshift({ ...route, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }
  localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
}

export function deleteLocalRoute(id: string): void {
  if (typeof window === 'undefined') return;
  const routes = getLocalRoutes().filter((r) => r.id !== id);
  localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
}

export function getLocalRoute(id: string): Route | undefined {
  return getLocalRoutes().find((r) => r.id === id);
}

/** Geocoding cache in sessionStorage to avoid duplicate API calls */
export function getCachedGeocode(address: string): { lat: number; lng: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = `geocode_${address}`;
    const cached = sessionStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export function setCachedGeocode(address: string, coords: { lat: number; lng: number }): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`geocode_${address}`, JSON.stringify(coords));
  } catch {
    // sessionStorage full — silently fail
  }
}
