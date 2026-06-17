"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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

const RANDOM_NAMES = [
  "Beast Mode",
  "Sweat Storm",
  "Thunder Round",
  "Iron Will",
  "Blaze Circuit",
  "Power Hour",
  "Grind Time",
  "Fire Drill",
  "Turbo Burn",
  "Savage Set",
  "Lightning Lap",
  "Muscle Mayhem",
  "Full Send",
  "Pain Train",
  "Rocket Fuel",
  "Chaos Mode",
  "Wrecking Ball",
  "Hyper Drive",
  "Atomic Drop",
  "Inferno Rush",
  "Viking Assault",
  "Nitro Blast",
  "Gut Check",
  "Iron Storm",
  "Primal Fury",
  "Death March",
  "Venom Circuit",
  "Solar Flare",
  "Juggernaut",
  "Titan Grind",
  "Earthquake",
  "Supernova",
  "War Cry",
  "Ghost Rider",
  "Thunderclap",
  "Meteor Shower",
  "Zero Gravity",
  "Berserker",
  "Dragon Breath",
  "Avalanche",
];

function getRandomName() {
  return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function WorkoutEditor({ workout }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [placeholderName] = useState(getRandomName);
  const [name, setName] = useState(workout?.name ?? "");
  const [rounds, setRounds] = useState(workout?.rounds ?? 1);
  const [restBetween, setRestBetween] = useState(
    workout?.rest_between_rounds ?? 30
  );
  const [restBetweenExercises, setRestBetweenExercises] = useState(
    workout?.rest_between_exercises ?? 15
  );

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

  const [runAfterSave, setRunAfterSave] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }

    const finalName = name.trim() || placeholderName;

    const payload: WorkoutInput = {
      name: finalName,
      rounds: Math.max(1, rounds),
      rest_between_rounds: Math.max(0, restBetween),
      rest_between_exercises: Math.max(0, restBetweenExercises),
      cue_halfway: true,
      cue_10s: true,
    };
    // Apply the global rest_between_exercises to each exercise
    const exercises: ExerciseInput[] = items.map((it, i) => ({
      position: i,
      name: it.name,
      type: it.type,
      duration_sec: it.duration_sec,
      reps: it.reps,
      rest_after_sec: restBetweenExercises,
    }));

    const shouldRun = runAfterSave;
    setRunAfterSave(false);

    startTransition(async () => {
      try {
        if (workout) {
          await updateWorkout(workout.id, payload, exercises);
          if (shouldRun) {
            router.push(`/workouts/${workout.id}/run`);
          } else {
            toast.success("Workout saved");
            router.push("/");
          }
        } else {
          const id = await createWorkout(payload, exercises);
          if (shouldRun) {
            router.push(`/workouts/${id}/run`);
          } else {
            router.push("/");
          }
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
      rest_after_sec: restBetweenExercises,
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
          placeholder={placeholderName}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <NumberField
            id="rounds"
            label="Rounds"
            value={rounds}
            min={1}
            onChange={setRounds}
            unit="rounds"
          />
          <Separator />
          <NumberField
            id="rest-between-rounds"
            label="Rest between rounds"
            value={restBetween}
            min={0}
            unit="sec"
            step={5}
            onChange={setRestBetween}
          />
          <Separator />
          <NumberField
            id="rest-between-exercises"
            label="Rest between exercises"
            value={restBetweenExercises}
            min={0}
            unit="sec"
            step={5}
            onChange={setRestBetweenExercises}
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
        {pending && !runAfterSave ? "Saving…" : "Save workout"}
      </Button>

      <Button
        type="submit"
        variant="outline"
        disabled={pending}
        onClick={() => setRunAfterSave(true)}
      >
        <Play className="size-4" />
        {pending && runAfterSave ? "Saving…" : "Run workout"}
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
        <div className="relative">
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            value={Number.isFinite(value) ? value : 0}
            onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
            className="w-20 text-center pt-1 pb-3 h-10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {unit ? (
            <span className="text-muted-foreground pointer-events-none absolute inset-x-0 bottom-1 text-center text-[9px]">
              {unit}
            </span>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(value + step)}
          aria-label={`Increase ${label}`}
        >
          +
        </Button>
      </div>
    </div>
  );
}
