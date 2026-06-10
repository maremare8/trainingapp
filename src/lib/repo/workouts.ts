import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Workout, WorkoutWithExercises, Exercise } from "@/types";

/**
 * Server-only data access helpers for workouts. All queries run under the
 * authenticated user's session, so RLS scopes results to that user.
 */

export async function listWorkouts(): Promise<WorkoutWithExercises[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("*, exercises(*)")
    .order("updated_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((w) => ({
    ...(w as Workout),
    exercises: (w.exercises as Exercise[])
      .slice()
      .sort((a, b) => a.position - b.position),
  }));
}

export async function getWorkout(
  id: string
): Promise<WorkoutWithExercises | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("*, exercises(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...(data as Workout),
    exercises: (data.exercises as Exercise[])
      .slice()
      .sort((a, b) => a.position - b.position),
  };
}
