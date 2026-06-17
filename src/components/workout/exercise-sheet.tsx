"use client";

import { useState } from "react";
import { Timer, Repeat } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ExerciseInput, ExerciseType } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ExerciseInput | null;
  onSave: (input: ExerciseInput) => void;
}

const DEFAULTS: ExerciseInput = {
  position: 0,
  name: "",
  type: "time",
  duration_sec: 30,
  reps: null,
  rest_after_sec: 15,
};

/**
 * Outer wrapper handles the Sheet portal; the inner form is only mounted while
 * `open` is true, so its useState initializers read fresh `initial` values each
 * time — no setState-in-effect needed.
 */
export function ExerciseSheet({ open, onOpenChange, initial, onSave }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh]">
        {open ? (
          <ExerciseForm
            initial={initial ?? null}
            onSave={(input) => {
              onSave(input);
              onOpenChange(false);
            }}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function ExerciseForm({
  initial,
  onSave,
}: {
  initial: ExerciseInput | null;
  onSave: (input: ExerciseInput) => void;
}) {
  const v = initial ?? DEFAULTS;
  const [name, setName] = useState(v.name);
  const [type, setType] = useState<ExerciseType>(v.type);
  const [duration, setDuration] = useState<number>(v.duration_sec ?? 30);
  const [reps, setReps] = useState<number>(v.reps ?? 10);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      position: initial?.position ?? 0,
      name: name.trim(),
      type,
      duration_sec: type === "time" ? Math.max(1, duration) : null,
      reps: type === "reps" ? Math.max(1, reps) : null,
      rest_after_sec: 0, // controlled at workout level now
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 px-6">
      <SheetHeader>
        <SheetTitle>{initial ? "Edit exercise" : "Add exercise"}</SheetTitle>
        <SheetDescription>
          {type === "time"
            ? "Counts down for the set duration."
            : "Tap Done when you finish the reps."}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ex-name">Name</Label>
        <Input
          id="ex-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Burpees"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <TypeButton
            active={type === "time"}
            onClick={() => setType("time")}
            icon={<Timer className="size-4" />}
            label="Timed"
          />
          <TypeButton
            active={type === "reps"}
            onClick={() => setType("reps")}
            icon={<Repeat className="size-4" />}
            label="Reps"
          />
        </div>
      </div>

      {type === "time" ? (
        <NumberRow
          id="ex-duration"
          label="Duration"
          unit="sec"
          value={duration}
          min={1}
          onChange={setDuration}
          quickSteps={[10, 15, 30, 45, 60]}
        />
      ) : (
        <NumberRow
          id="ex-reps"
          label="Reps"
          unit="reps"
          value={reps}
          min={1}
          onChange={setReps}
          quickSteps={[5, 10, 15, 20, 25]}
        />
      )}

      <SheetFooter>
        <Button type="submit" className="w-full">
          {initial ? "Save" : "Add exercise"}
        </Button>
      </SheetFooter>
    </form>
  );
}

function TypeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
        active
          ? "border-transparent bg-primary/10 text-foreground"
          : "border-border bg-background text-muted-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function NumberRow({
  id,
  label,
  unit,
  value,
  min,
  onChange,
  quickSteps,
}: {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  onChange: (n: number) => void;
  quickSteps: number[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(Math.max(min, value - 5))}
          aria-label={`Decrease ${label}`}
        >
          −
        </Button>
        <div className="relative flex-1">
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            value={Number.isFinite(value) ? value : 0}
            onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
            className="text-center text-base pt-1 pb-3 h-10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-muted-foreground pointer-events-none absolute inset-x-0 bottom-1 text-center text-[9px]">
            {unit}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(value + 5)}
          aria-label={`Increase ${label}`}
        >
          +
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {quickSteps.map((n) => (
          <Button
            key={n}
            type="button"
            variant="outline"
            size="xs"
            onClick={() => onChange(n)}
          >
            {n}
          </Button>
        ))}
      </div>
    </div>
  );
}
