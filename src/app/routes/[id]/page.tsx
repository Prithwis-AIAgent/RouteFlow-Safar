'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Route, Stop } from '@/types';
import { supabase } from '@/lib/supabase';
import { getLocalRoute, saveLocalRoute } from '@/lib/storage';
import { useProfile } from '@/hooks/useProfile';
import { getRouteNamePlaceholder, getStopLabelPlaceholder } from '@/lib/roleContent';
import StopList from '@/components/StopList';
import LaunchButton from '@/components/LaunchButton';
import { StopSkeleton } from '@/components/Skeletons';
import toast from 'react-hot-toast';
import Link from 'next/link';

const MAX_STOPS = 20;

function createEmptyStop(position: number): Stop {
  return { id: uuidv4(), label: '', address: '', position };
}

export default function EditRoutePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { role } = useProfile();

  const routeNamePlaceholder = getRouteNamePlaceholder(role);
  const stopLabelPlaceholder = getStopLabelPlaceholder(role);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const loadRoute = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user && navigator.onLine) {
        const { data, error } = await supabase
          .from('routes')
          .select('*, stops(*)')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        const route = data as Route;
        setName(route.name);
        setDescription(route.description ?? '');
        const sortedStops = (route.stops ?? []).sort((a, b) => a.position - b.position);
        setStops(sortedStops.length >= 2 ? sortedStops : [...sortedStops, createEmptyStop(sortedStops.length)]);
      } else {
        const local = getLocalRoute(id);
        if (local) {
          setName(local.name);
          setDescription(local.description ?? '');
          const sortedStops = (local.stops ?? []).sort((a, b) => a.position - b.position);
          setStops(sortedStops.length >= 2 ? sortedStops : [...sortedStops, createEmptyStop(sortedStops.length)]);
        } else {
          toast.error('Route not found');
          router.push('/');
        }
      }
    } catch {
      const local = getLocalRoute(id);
      if (local) {
        setName(local.name);
        setDescription(local.description ?? '');
        setStops(local.stops ?? []);
      } else {
        toast.error('Route not found');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadRoute();
  }, [loadRoute]);

  const handleUpdateStop = useCallback((stopId: string, field: keyof Stop, value: string | number) => {
    setStops((prev) => prev.map((s) => s.id === stopId ? { ...s, [field]: value } : s));
  }, []);

  const handleAddressSelect = useCallback((stopId: string, address: string, lat?: number, lng?: number) => {
    setStops((prev) => prev.map((s) => s.id === stopId ? { ...s, address, lat, lng } : s));
  }, []);

  const handleDeleteStop = useCallback((stopId: string) => {
    setStops((prev) => {
      if (prev.length <= 2) {
        toast.error('A route needs at least 2 stops');
        return prev;
      }
      return prev.filter((s) => s.id !== stopId).map((s, i) => ({ ...s, position: i }));
    });
  }, []);

  const handleAddStop = () => {
    if (stops.length >= MAX_STOPS) {
      toast.error(`Maximum ${MAX_STOPS} stops allowed`);
      return;
    }
    setStops((prev) => [...prev, createEmptyStop(prev.length)]);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
          );
          const data = await res.json();
          const address = data.results?.[0]?.formatted_address ?? `${lat}, ${lng}`;
          const locationStop: Stop = { id: uuidv4(), label: 'My Location', address, lat, lng, position: 0 };
          setStops((prev) => [locationStop, ...prev].map((s, i) => ({ ...s, position: i })));
          toast.success('Current location added as first stop');
        } catch {
          toast.error('Could not reverse geocode your location');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        toast.error(err.code === 1 ? 'Location permission denied' : 'Could not get location');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Route name is required');
      return;
    }
    const validStops = stops.filter((s) => s.address.trim());
    if (validStops.length < 2) {
      toast.error('Add at least 2 stops with addresses');
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    const updatedRoute: Route = {
      id,
      name: name.trim(),
      description: description.trim() || undefined,
      stops: validStops.map((s, i) => ({ ...s, route_id: id, position: i })),
      updated_at: now,
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user && navigator.onLine) {
        // Update route record
        const { error: routeErr } = await supabase
          .from('routes')
          .update({ name: updatedRoute.name, description: updatedRoute.description, updated_at: now })
          .eq('id', id)
          .eq('user_id', user.id);
        if (routeErr) throw routeErr;

        // Replace stops: delete old, insert new
        await supabase.from('stops').delete().eq('route_id', id);
        const stopsPayload = validStops.map((s, i) => ({
          id: s.id,
          route_id: id,
          label: s.label,
          address: s.address,
          lat: s.lat,
          lng: s.lng,
          position: i,
        }));
        const { error: stopsErr } = await supabase.from('stops').insert(stopsPayload);
        if (stopsErr) throw stopsErr;
      }

      saveLocalRoute(updatedRoute);
      toast.success('Route updated!');
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update route';
      toast.error(msg);
      saveLocalRoute(updatedRoute);
      toast('Saved locally as backup', { icon: '💾' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-40 animate-pulse mb-2" />
          <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-28 animate-pulse" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 border border-gray-200 dark:border-slate-700 animate-pulse space-y-4">
          <div className="h-11 bg-gray-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-11 bg-gray-100 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <StopSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header flex items-center gap-3">
        <Link href="/" className="btn-icon text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 -ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="page-title">Edit Route</h1>
          <p className="text-sm text-muted mt-0.5">Update your delivery plan</p>
        </div>
      </div>

      {/* Route details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
        <div>
          <label htmlFor="edit-route-name" className="input-label">
            Route Name <span className="text-danger">*</span>
          </label>
          <input
            id="edit-route-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={routeNamePlaceholder}
            className="input-field"
            maxLength={80}
          />
        </div>
        <div>
          <label htmlFor="edit-route-description" className="input-label">
            Description <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            id="edit-route-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. North zone — 14 packages"
            className="input-field"
            maxLength={200}
          />
        </div>
      </div>

      {/* Stops */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Stops ({stops.length}/{MAX_STOPS})</p>
          <button
            onClick={handleUseMyLocation}
            disabled={locating}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
            id="edit-use-location-btn"
          >
            {locating ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            )}
            {locating ? 'Locating…' : 'Use my location'}
          </button>
        </div>

        <StopList
          stops={stops}
          onStopsChange={setStops}
          onUpdate={handleUpdateStop}
          onDelete={handleDeleteStop}
          onAddressSelect={handleAddressSelect}
          labelPlaceholder={stopLabelPlaceholder}
        />

        {stops.length < MAX_STOPS && (
          <button
            onClick={handleAddStop}
            className="mt-3 w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium text-sm hover:border-primary hover:text-primary hover:bg-blue-50 transition-all"
            id="edit-add-stop-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Stop
          </button>
        )}

        <p className="mt-3 text-xs text-gray-500 flex items-center gap-1.5 justify-center md:justify-start">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.084-1.083l.352-.176a.75.75 0 00-1.084 1.083l.041.02zM12 18.75a.75.75 0 00.75-.75V12a.75.75 0 00-1.5 0v6a.75.75 0 00.75.75zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
          </svg>
          Stop 1 is your starting point. Stops are launched in order.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sticky bottom-20 md:bottom-6 pt-3">
        <LaunchButton stops={stops} className="w-full" />
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full"
          id="edit-save-route-btn"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
