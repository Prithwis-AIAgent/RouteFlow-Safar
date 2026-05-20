'use client';

import { Route } from '@/types';
import { launchRoute } from '@/lib/maps';
import Link from 'next/link';

interface RouteCardProps {
  route: Route;
  onDelete: (id: string) => void;
}

export default function RouteCard({ route, onDelete }: RouteCardProps) {
  const stops = [...(route.stops ?? [])].sort((a, b) => a.position - b.position);
  const stopCount = stops.length;
  const updatedAt = route.updated_at
    ? new Date(route.updated_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const handleLaunch = () => {
    if (stops.length >= 2) {
      launchRoute(stops);
    }
  };

  return (
    <div className="route-card group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
            {route.name}
          </h2>
          {route.description && (
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{route.description}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className="stop-badge">
            {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
          </span>
        </div>
      </div>

      {/* Stop preview */}
      {stops.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {stops.slice(0, 3).map((stop, idx) => (
            <div key={stop.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
              <span className="stop-dot">{idx + 1}</span>
              <span className="truncate">{stop.label || stop.address}</span>
            </div>
          ))}
          {stops.length > 3 && (
            <p className="text-xs text-gray-400 dark:text-slate-500 pl-7">+{stops.length - 3} more stops</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700/50">
        <span className="text-xs text-gray-400 dark:text-slate-400">Updated {updatedAt}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(route.id)}
            className="btn-icon text-gray-400 dark:text-slate-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-950/30"
            title="Delete route"
            aria-label="Delete route"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
          <Link
            href={`/routes/${route.id}`}
            className="btn-secondary text-sm py-2 px-3"
          >
            Edit
          </Link>
          <button
            onClick={handleLaunch}
            disabled={stopCount < 2}
            className="btn-primary text-sm py-2 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Launch
          </button>
        </div>
      </div>
    </div>
  );
}
