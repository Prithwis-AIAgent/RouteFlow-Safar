'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PlacePrediction } from '@/types';
import { getCachedGeocode, setCachedGeocode } from '@/lib/storage';

interface AddressSearchProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

declare global {
  interface Window {
    initGoogleMaps?: () => void;
  }
}

let autocompleteService: google.maps.places.AutocompleteService | null = null;
let geocoder: google.maps.Geocoder | null = null;
let mapsLoaded = false;
let loadPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (mapsLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    if (window.google?.maps?.places) {
      mapsLoaded = true;
      resolve();
      return;
    }
    window.initGoogleMaps = () => {
      mapsLoaded = true;
      autocompleteService = new window.google.maps.places.AutocompleteService();
      geocoder = new window.google.maps.Geocoder();
      resolve();
    };
    const script = document.createElement('script');
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });

  return loadPromise;
}

export default function AddressSearch({ value, onChange, placeholder = 'Search address...', id, className }: AddressSearchProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGoogleMaps().then(() => {
      if (!autocompleteService && window.google?.maps?.places) {
        autocompleteService = new window.google.maps.places.AutocompleteService();
        geocoder = new window.google.maps.Geocoder();
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteService || input.length < 3) {
      setPredictions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    autocompleteService.getPlacePredictions(
      { input },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (results: any, status: any) => {
        setLoading(false);
        if (status === 'OK' && results) {
          setPredictions(results as unknown as PlacePrediction[]);
          setOpen(true);
        } else {
          setPredictions([]);
          setOpen(false);
        }
      }
    );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    clearTimeout(debounceRef.current);
    if (val.length >= 3 && ready) {
      debounceRef.current = setTimeout(() => fetchPredictions(val), 300);
    } else {
      setPredictions([]);
      setOpen(false);
    }
  };

  const handleSelect = async (prediction: PlacePrediction) => {
    const address = prediction.description;
    setQuery(address);
    setOpen(false);
    setPredictions([]);

    // Check geocode cache first
    const cached = getCachedGeocode(address);
    if (cached) {
      onChange(address, cached.lat, cached.lng);
      return;
    }

    // Geocode via Geocoder API
    if (geocoder) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      geocoder.geocode({ placeId: prediction.place_id }, (results: any, status: any) => {
        if (status === 'OK' && results?.[0]) {
          const loc = results[0].geometry.location;
          const coords = { lat: loc.lat(), lng: loc.lng() };
          setCachedGeocode(address, coords);
          onChange(address, coords.lat, coords.lng);
        } else {
          onChange(address);
        }
      });
    } else {
      onChange(address);
    }
  };

  const listboxId = id ? `${id}-listbox` : 'address-search-listbox';

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        role="combobox"
        aria-controls={listboxId}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => predictions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={`input-field ${className || ''}`}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {open && predictions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-auto max-h-[300px]"
        >
          {predictions.map((pred) => (
            <li
              key={pred.place_id}
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(pred)}
              className="px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700/60 transition-colors border-b border-gray-50 dark:border-slate-700/40 last:border-0 min-h-[60px] flex flex-col justify-center"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100 line-clamp-2 leading-tight">
                {pred.structured_formatting?.main_text ?? pred.description}
              </p>
              {pred.structured_formatting?.secondary_text && (
                <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {pred.structured_formatting.secondary_text}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
