"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBodyStats } from "@/app/(app)/actions";

export function BodyStatsSettings({
  weightKg: initialWeight,
  sex: initialSex,
}: {
  weightKg: number | null;
  sex: "male" | "female" | null;
}) {
  const [pending, startTransition] = useTransition();
  const [weightKg, setWeightKg] = useState(initialWeight?.toString() ?? "");
  const [sex, setSex] = useState<"male" | "female" | null>(initialSex);

  function save(newWeight: string, newSex: "male" | "female" | null) {
    const parsed = newWeight ? parseFloat(newWeight) : null;
    if (parsed !== null && (isNaN(parsed) || parsed <= 0 || parsed > 500)) return;

    startTransition(async () => {
      try {
        await updateBodyStats(parsed, newSex);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">Body stats</label>
      <p className="text-muted-foreground text-xs">
        Used for calorie estimation. Your data stays private.
      </p>
      <div className="mt-1 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="weight-kg" className="text-sm font-medium">
            Weight
          </Label>
          <div className="relative w-24">
            <Input
              id="weight-kg"
              type="number"
              inputMode="decimal"
              min={20}
              max={500}
              step={0.1}
              value={weightKg}
              disabled={pending}
              onChange={(e) => setWeightKg(e.target.value)}
              onBlur={() => save(weightKg, sex)}
              className="h-8 pr-8 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="—"
            />
            <span className="text-muted-foreground pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs">
              kg
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="sex" className="text-sm font-medium">
            Sex
          </Label>
          <div className="flex gap-1 rounded-lg border p-0.5">
            {(["male", "female"] as const).map((option) => (
              <button
                key={option}
                type="button"
                disabled={pending}
                onClick={() => {
                  setSex(option);
                  save(weightKg, option);
                }}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  sex === option
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
