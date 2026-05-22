'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Route } from '@/types';
import { supabase } from '@/lib/supabase';
import { getLocalRoutes, deleteLocalRoute, saveLocalRoute } from '@/lib/storage';
import { useProfile } from '@/hooks/useProfile';
import { getEmptyStateSubtitle } from '@/lib/roleContent';
import RouteCard from '@/components/RouteCard';
import { RouteCardSkeleton } from '@/components/Skeletons';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { profile, role, loading: profileLoading } = useProfile();

  const loadRoutes = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    } else {
      setSyncing(true);
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsGuest(!user);

      if (!user) {
        setRoutes(getLocalRoutes());
        return;
      }

      // Onboarding check — redirect if role not yet set
      if (!profileLoading && profile !== null && !profile?.role) {
        router.push('/onboarding');
        return;
      }

      if (!navigator.onLine) {
        setRoutes(getLocalRoutes());
        return;
      }

      const { data: routeData, error } = await supabase
        .from('routes')
        .select('*, stops(*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const routesWithSortedStops = (routeData ?? []).map((r: Route) => ({
        ...r,
        stops: (r.stops ?? []).sort((a, b) => a.position - b.position),
      }));

      setRoutes(routesWithSortedStops);
      routesWithSortedStops.forEach((r) => saveLocalRoute(r));
    } catch (err) {
      console.error('Error loading routes:', err);
      // Fallback only if we don't have routes loaded already
      if (!isBackground) {
        setRoutes(getLocalRoutes());
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [profileLoading, profile, router]);

  // Read local routes immediately on mount, then trigger background fetch
  useEffect(() => {
    const local = getLocalRoutes();
    setRoutes(local);
    setLoading(false);
    loadRoutes(true);
  }, [loadRoutes]);

  // Reconnect sync
  useEffect(() => {
    const handleOnline = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const localRoutes = getLocalRoutes();
      if (localRoutes.length === 0) return;

      const { data: existing } = await supabase
        .from('routes')
        .select('id')
        .eq('user_id', user.id);

      const existingIds = new Set((existing ?? []).map((r: { id: string }) => r.id));
      const toSync = localRoutes.filter((r) => !existingIds.has(r.id));

      for (const route of toSync) {
        const { stops, ...routeData } = route;
        await supabase.from('routes').upsert({ ...routeData, user_id: user.id });
        if (stops?.length) {
          await supabase.from('stops').upsert(stops.map((s) => ({ ...s, route_id: route.id })));
        }
      }

      if (toSync.length > 0) {
        toast.success(`Synced ${toSync.length} route${toSync.length > 1 ? 's' : ''} to cloud`);
        loadRoutes();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [loadRoutes]);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Delete this route? This cannot be undone.');
    if (!confirm) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && navigator.onLine) {
        const { error } = await supabase.from('routes').delete().eq('id', id);
        if (error) throw error;
      }
      deleteLocalRoute(id);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Route deleted');
    } catch {
      toast.error('Failed to delete route');
    }
  };

  const emptySubtitle = getEmptyStateSubtitle(role);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            {profile?.full_name ? `Hey, ${profile.full_name.split(' ')[0]}! 👋` : 'My Routes'}
            {syncing && (
              <span className="inline-flex items-center text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full gap-1 animate-pulse" id="routes-syncing-badge">
                <svg className="w-3 h-3 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing...
              </span>
            )}
          </h1>
          <p className="text-sm text-muted mt-1">
            {isGuest
              ? 'Guest mode — sign in to sync routes'
              : `${routes.length} saved route${routes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {isGuest && (
          <Link href="/auth/login" className="btn-secondary text-sm px-3 py-2">
            Sign in
          </Link>
        )}
      </div>

      {/* Route list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <RouteCardSkeleton key={i} />)}
        </div>
      ) : routes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1A56DB" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">No routes yet</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm max-w-xs mb-6">{emptySubtitle}</p>
          <Link href="/routes/new" className="btn-primary gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create First Route
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      {!loading && (
        <Link href="/routes/new" className="fab">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Route
        </Link>
      )}
    </div>
  );
}
