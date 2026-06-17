"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ExerciseList,
  type DraftExercise,
} from "@/components/workout/exercise-list";
import { ExerciseSheet } from "@/components/workout/exercise-sheet";
import {
  createWorkout,
  updateWorkout,
} from "@/app/(app)/actions";
import type {
  ExerciseInput,
  WorkoutInput,
  WorkoutWithExercises,
} from "@/types";
import { estimateExercisesDuration } from "@/lib/workout-stats";
import { formatDurationShort } from "@/lib/format";

interface Props {
  workout?: WorkoutWithExercises;
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function WorkoutEditor({ workout }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(workout?.name ?? "");
  const [rounds, setRounds] = useState(workout?.rounds ?? 1);
  const [restBetween, setRestBetween] = useState(
    workout?.rest_between_rounds ?? 30
  );
  const [cueHalfway, setCueHalfway] = useState(workout?.cue_halfway ?? true);
  const [cue10s, setCue10s] = useState(workout?.cue_10s ?? true);

  const [items, setItems] = useState<DraftExercise[]>(
    () =>
      workout?.exercises.map((e, i) => ({
        draftId: makeId(),
        position: i,
        name: e.name,
        type: e.type,
        duration_sec: e.duration_sec,
        reps: e.reps,
        rest_after_sec: e.rest_after_sec,
      })) ?? []
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = editingId
    ? items.find((i) => i.draftId === editingId) ?? null
    : null;

  function onAddClick() {
    setEditingId(null);
    setSheetOpen(true);
  }

  function onEditClick(draftId: string) {
    setEditingId(draftId);
    setSheetOpen(true);
  }

  function onSaveExercise(input: ExerciseInput) {
    if (editingId) {
      setItems((prev) =>
        prev.map((it) =>
          it.draftId === editingId ? { ...it, ...input } : it
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        { ...input, draftId: makeId(), position: prev.length },
      ]);
    }
  }

  function onDuplicate(draftId: string) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.draftId === draftId);
      if (idx < 0) return prev;
      const source = prev[idx];
      const copy: DraftExercise = { ...source, draftId: makeId() };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function onDelete(draftId: string) {
    setItems((prev) => prev.filter((i) => i.draftId !== draftId));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Give your workout a name");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }

    const payload: WorkoutInput = {
      name: name.trim(),
      rounds: Math.max(1, rounds),
      rest_between_rounds: Math.max(0, restBetween),
      cue_halfway: cueHalfway,
      cue_10s: cue10s,
    };
    const exercises: ExerciseInput[] = items.map((it, i) => ({
      position: i,
      name: it.name,
      type: it.type,
      duration_sec: it.duration_sec,
      reps: it.reps,
      rest_after_sec: it.rest_after_sec,
    }));

    startTransition(async () => {
      try {
        if (workout) {
          await updateWorkout(workout.id, payload, exercises);
          toast.success("Workout saved");
          router.refresh();
        } else {
          await createWorkout(payload, exercises);
          // createWorkout redirects on success — toast lives on the destination
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save");
      }
    });
  }

  const totalSec = estimateExercisesDuration(
    items.map((it, i) => ({
      id: it.draftId,
      workout_id: "",
      position: i,
      name: it.name,
      type: it.type,
      duration_sec: it.duration_sec,
      reps: it.reps,
      rest_after_sec: it.rest_after_sec,
      created_at: "",
    }))
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button
          render={<Link href="/" aria-label="Back" />}
          variant="ghost"
          size="icon-sm"
          type="button"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">
          {workout ? "Edit workout" : "New workout"}
        </h1>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="workout-name">Name</Label>
        <Input
          id="workout-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning HIIT"
          required
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <NumberField
            id="rounds"
            label="Rounds"
            value={rounds}
            min={1}
            onChange={setRounds}
            hint="Loop the whole sequence"
          />
          <Separator />
          <NumberField
            id="rest-between"
            label="Rest between rounds"
            value={restBetween}
            min={0}
            unit="sec"
            step={5}
            onChange={setRestBetween}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 py-4">
          <div className="text-sm font-semibold">Voice cues</div>
          <CueRow
            id="cue-half"
            label="Announce at halfway"
            description="On timed exercises only"
            checked={cueHalfway}
            onChange={setCueHalfway}
          />
          <CueRow
            id="cue-10s"
            label="Announce 10 seconds left"
            description="On timed exercises only"
            checked={cue10s}
            onChange={setCue10s}
          />
        </CardContent>
      </Card>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm font-semibold">Exercises</div>
          <p className="text-muted-foreground text-xs">
            {items.length === 0
              ? "No exercises yet"
              : `${items.length} · ~${formatDurationShort(totalSec)} per round`}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAddClick}>
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="text-muted-foreground px-4 py-8 text-center text-sm">
          Add your first exercise.
        </Card>
      ) : (
        <ExerciseList
          items={items}
          onReorder={setItems}
          onEdit={onEditClick}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      )}

      <ExerciseSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initial={editing}
        onSave={onSaveExercise}
      />

      <Button type="submit" disabled={pending} className="mt-2">
        <Save className="size-4" />
        {pending ? "Saving…" : "Save workout"}
      </Button>
    </form>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  unit,
  onChange,
  hint,
  step = 1,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  unit?: string;
  onChange: (n: number) => void;
  hint?: string;
  step?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {hint ? (
          <p className="text-muted-foreground text-xs">{hint}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(Math.max(min, value - step))}
          aria-label={`Decrease ${label}`}
        >
          −
        </Button>
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className="w-16 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(value + step)}
          aria-label={`Increase ${label}`}
        >
          +
        </Button>
        {unit ? (
          <span className="text-muted-foreground w-8 text-xs">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}

function CueRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
