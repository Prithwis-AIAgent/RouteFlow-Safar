'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Stop } from '@/types';
import StopItem from './StopItem';

interface StopListProps {
  stops: Stop[];
  onStopsChange: (stops: Stop[]) => void;
  onUpdate: (id: string, field: keyof Stop, value: string | number) => void;
  onDelete: (id: string) => void;
  onAddressSelect: (id: string, address: string, lat?: number, lng?: number) => void;
  labelPlaceholder?: string;
}

export default function StopList({ stops, onStopsChange, onUpdate, onDelete, onAddressSelect, labelPlaceholder }: StopListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stops.findIndex((s) => s.id === active.id);
    const newIndex = stops.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(stops, oldIndex, newIndex).map((s, i) => ({
      ...s,
      position: i,
    }));
    onStopsChange(reordered);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {stops.map((stop, index) => (
            <StopItem
              key={stop.id}
              stop={stop}
              index={index}
              isLast={index === stops.length - 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddressSelect={onAddressSelect}
              labelPlaceholder={labelPlaceholder}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
