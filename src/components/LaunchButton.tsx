'use client';

import { Stop } from '@/types';
import { launchRoute } from '@/lib/maps';
import toast from 'react-hot-toast';

interface LaunchButtonProps {
  stops: Stop[];
  className?: string;
}

export default function LaunchButton({ stops, className = '' }: LaunchButtonProps) {
  const handleLaunch = () => {
    const validStops = stops.filter((s) => s.address.trim());
    if (validStops.length < 2) {
      toast.error('Add at least 2 stops to launch in Maps');
      return;
    }
    const sortedStops = [...validStops].sort((a, b) => a.position - b.position);
    launchRoute(sortedStops);
    toast.success('Opening in Google Maps…');
  };

  const hasEnoughStops = stops.filter((s) => s.address.trim()).length >= 2;

  return (
    <button
      onClick={handleLaunch}
      disabled={!hasEnoughStops}
      className={`btn-launch gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
      Launch in Maps
    </button>
  );
}
