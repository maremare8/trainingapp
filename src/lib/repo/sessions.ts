import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutSession } from "@/types";

export async function listSessions(limit = 50): Promise<WorkoutSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as WorkoutSession[];
}
