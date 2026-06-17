"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restorePresets } from "@/app/(app)/actions";

export function RestorePresetsButton() {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      try {
        await restorePresets();
        toast.success("Preset workouts restored");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to restore");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={onClick}
      className="w-full"
    >
      <RotateCcw className="size-4" />
      {pending ? "Restoring…" : "Restore preset workouts"}
    </Button>
  );
}
