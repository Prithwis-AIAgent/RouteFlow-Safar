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
      {/* Left side: Drag handle, stop number, START/END badge, and clear button */}
      <div className="flex flex-col items-center gap-1.5 min-w-[48px] flex-shrink-0">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="drag-handle touch-none text-gray-400"
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        </button>

        {/* Number circle */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${index === 0 ? 'bg-success' : isLast ? 'bg-danger' : 'bg-primary'}`}>
          {index + 1}
        </div>

        {/* START/END badge */}
        {index === 0 && (
          <span className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
            Start
          </span>
        )}
        {isLast && index > 0 && (
          <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
            End
          </span>
        )}

        {/* Clear address button - only show if address has text */}
        {stop.address && (
          <button
            type="button"
            onClick={() => onAddressSelect(stop.id, '')}
            className="text-gray-400 hover:text-red-500 transition-colors mt-1"
            aria-label="Clear address"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="flex-1 min-w-0 space-y-2">
        <AddressSearch
          id={`stop-address-${stop.id}`}
          value={stop.address}
          onChange={(addr, lat, lng) => onAddressSelect(stop.id, addr, lat, lng)}
          placeholder={index === 0 ? 'Starting point' : `Stop ${index + 1} address`}
          className="h-12 text-base"
        />
        <input
          type="text"
          value={stop.label}
          onChange={(e) => onUpdate(stop.id, 'label', e.target.value)}
          placeholder={`Label (optional) ${labelPlaceholder}`}
          className="input-field h-12 text-base"
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
