'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Stop } from '@/types';
import AddressSearch from './AddressSearch';

interface StopItemProps {
  stop: Stop;
  index: number;
  isLast: boolean;
  onUpdate: (id: string, field: keyof Stop, value: string | number) => void;
  onDelete: (id: string) => void;
  onAddressSelect: (id: string, address: string, lat?: number, lng?: number) => void;
  labelPlaceholder?: string;
}

export default function StopItem({ stop, index, isLast, onUpdate, onDelete, onAddressSelect, labelPlaceholder = 'e.g. Customer: Sharma Ji' }: StopItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`stop-item ${isDragging ? 'shadow-2xl scale-[1.02] ring-2 ring-primary/30' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="drag-handle touch-none"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      </button>

      {/* Stop number badge */}
      <div className="flex items-center gap-1.5 mt-2.5 flex-shrink-0">
        <div className={`stop-number ${index === 0 ? '!bg-success' : isLast ? '!bg-danger' : ''} !mt-0`}>
          {index + 1}
        </div>
        {index === 0 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
            START
          </span>
        )}
        {isLast && index > 0 && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
            END
          </span>
        )}
      </div>

      {/* Fields */}
      <div className="flex-1 min-w-0 space-y-2">
        <AddressSearch
          id={`stop-address-${stop.id}`}
          value={stop.address}
          onChange={(addr, lat, lng) => onAddressSelect(stop.id, addr, lat, lng)}
          placeholder={index === 0 ? 'Starting point' : `Stop ${index + 1} address`}
        />
        <input
          type="text"
          value={stop.label}
          onChange={(e) => onUpdate(stop.id, 'label', e.target.value)}
          placeholder={`Label (optional) ${labelPlaceholder}`}
          className="input-field text-sm"
        />
        {/* Hidden: address selection with geocode */}
        <span className="sr-only" aria-live="polite">
          {stop.address ? `Address set: ${stop.address}` : ''}
        </span>
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(stop.id)}
        className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl text-gray-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
        aria-label={`Delete stop ${index + 1}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
