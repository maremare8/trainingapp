import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import { StreakGoalPicker } from "./streak-goal-picker";
import { VoiceCueSettings } from "./voice-cue-settings";
import { BodyStatsSettings } from "./body-stats-settings";
import { RestorePresetsButton } from "./restore-presets-button";
import { getStreakGoal, getVoiceCueSettings, getBodyStats } from "@/app/(app)/actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  let email: string | null = null;
  let streakGoal = 2;
  let voiceCues = { cue_halfway: true, cue_10s: true };
  let bodyStats: { weight_kg: number | null; sex: "male" | "female" | null } = {
    weight_kg: null,
    sex: null,
  };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
    [streakGoal, voiceCues, bodyStats] = await Promise.all([
      getStreakGoal(),
      getVoiceCueSettings(),
      getBodyStats(),
    ]);
  } catch {
    // Supabase not configured yet — render without account info.
  }

  return (
    <>
      <PageHeader title="Settings" />

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Signed in as</p>
              <p className="truncate font-medium">{email ?? "Not signed in"}</p>
            </div>
            <SignOutButton />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <StreakGoalPicker currentGoal={streakGoal} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <VoiceCueSettings cueHalfway={voiceCues.cue_halfway} cue10s={voiceCues.cue_10s} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <BodyStatsSettings weightKg={bodyStats.weight_kg} sex={bodyStats.sex} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2 py-4">
            <label className="text-sm font-medium">Workouts</label>
            <p className="text-muted-foreground text-xs">
              Add preset bodyweight, kettlebell, and TRX workouts. Existing presets won&apos;t be duplicated.
            </p>
            <RestorePresetsButton />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
