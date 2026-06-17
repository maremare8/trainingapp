import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import { StreakGoalPicker } from "./streak-goal-picker";
import { getStreakGoal } from "@/app/(app)/actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  let email: string | null = null;
  let streakGoal = 2;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
    streakGoal = await getStreakGoal();
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
      </div>
    </>
  );
}
