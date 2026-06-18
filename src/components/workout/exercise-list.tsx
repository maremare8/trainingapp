"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Copy,
  Trash2,
  Timer,
  Repeat,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDuration } from "@/lib/format";
import { resolveEquipment } from "@/lib/equipment";
import type { ExerciseInput } from "@/types";

interface DraftExercise extends ExerciseInput {
  /** Stable client-side id so the sortable list can key items before they're saved. */
  draftId: string;
}

interface Props {
  items: DraftExercise[];
  onReorder: (next: DraftExercise[]) => void;
  onEdit: (draftId: string) => void;
  onDuplicate: (draftId: string) => void;
  onDelete: (draftId: string) => void;
}

export function ExerciseList({
  items,
  onReorder,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.draftId === active.id);
    const newIndex = items.findIndex((i) => i.draftId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.draftId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <SortableItem
              key={item.draftId}
              item={item}
              onEdit={() => onEdit(item.draftId)}
              onDuplicate={() => onDuplicate(item.draftId)}
              onDelete={() => onDelete(item.draftId)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  item,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  item: DraftExercise;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.draftId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const Icon = item.type === "time" ? Timer : Repeat;
  const measure =
    item.type === "time"
      ? formatDuration(item.duration_sec ?? 0)
      : `${item.reps ?? 0} reps`;
  const equipmentItems = resolveEquipment(item.equipment ?? []);

  return (
    <Card ref={setNodeRef} style={style} className="touch-none py-0">
      <div className="flex items-center gap-2 px-2 py-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground touch-none px-1 py-2"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-5" />
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 flex-1 text-left"
        >
          <div className="truncate font-medium">{item.name}</div>
          <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <Icon className="size-3" />
              {measure}
            </span>
            {item.rest_after_sec > 0 ? (
              <span>· rest {formatDuration(item.rest_after_sec)}</span>
            ) : null}
          </div>
          {equipmentItems.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {equipmentItems.map((eq) => (
                <span
                  key={eq.id}
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${eq.badgeClasses}`}
                >
                  {eq.label}
                </span>
              ))}
            </div>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" type="button">
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="size-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

export type { DraftExercise };
