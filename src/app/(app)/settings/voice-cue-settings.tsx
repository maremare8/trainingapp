"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateVoiceCues } from "@/app/(app)/actions";

export function VoiceCueSettings({
  cueHalfway,
  cue10s,
}: {
  cueHalfway: boolean;
  cue10s: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function update(halfway: boolean, tenSec: boolean) {
    startTransition(async () => {
      try {
        await updateVoiceCues(halfway, tenSec);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">Voice cues</label>
      <p className="text-muted-foreground text-xs">
        Audio announcements during timed exercises.
      </p>
      <div className="mt-1 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Label htmlFor="cue-halfway" className="text-sm font-medium">
              Halfway announcement
            </Label>
          </div>
          <Switch
            id="cue-halfway"
            checked={cueHalfway}
            disabled={pending}
            onCheckedChange={(checked) => update(checked, cue10s)}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Label htmlFor="cue-10s" className="text-sm font-medium">
              10 seconds left
            </Label>
          </div>
          <Switch
            id="cue-10s"
            checked={cue10s}
            disabled={pending}
            onCheckedChange={(checked) => update(cueHalfway, checked)}
          />
        </div>
      </div>
    </div>
  );
}
