"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateStreakGoal } from "@/app/(app)/actions";

const options = [
  { value: 1, label: "Every day" },
  { value: 2, label: "Every other day" },
  { value: 3, label: "Every 3 days" },
  { value: 4, label: "Twice a week" },
  { value: 7, label: "Once a week" },
];

export function StreakGoalPicker({ currentGoal }: { currentGoal: number }) {
  const [pending, startTransition] = useTransition();

  function handleSelect(days: number) {
    startTransition(async () => {
      try {
        await updateStreakGoal(days);
        toast.success("Streak goal updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Workout frequency goal</label>
      <p className="text-muted-foreground text-xs">
        How often do you want to work out? Your streak tracks whether you keep up.
      </p>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            disabled={pending}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              currentGoal === value
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground/30"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
