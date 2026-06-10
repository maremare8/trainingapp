"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ExerciseInput, WorkoutInput, SessionStatus } from "@/types";

/**
 * All mutations for workouts, exercises and session history. Each action
 * authenticates the user explicitly and relies on RLS for authorization.
 */

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, userId: user.id };
}

// ---------------------------------------------------------------------------
// Workouts
// ---------------------------------------------------------------------------

export async function createWorkout(
  workout: WorkoutInput,
  exercises: ExerciseInput[]
) {
  const { supabase, userId } = await getUserId();

  const { data: created, error } = await supabase
    .from("workouts")
    .insert({ ...workout, user_id: userId })
    .select("id")
    .single();
  if (error) throw error;

  if (exercises.length > 0) {
    const rows = exercises.map((e, i) => ({ ...e, position: i, workout_id: created.id }));
    const { error: exErr } = await supabase.from("exercises").insert(rows);
    if (exErr) throw exErr;
  }

  revalidatePath("/");
  redirect(`/workouts/${created.id}/edit?created=1`);
}

export async function updateWorkout(
  id: string,
  workout: WorkoutInput,
  exercises: ExerciseInput[]
) {
  const { supabase } = await getUserId();

  const { error: wErr } = await supabase
    .from("workouts")
    .update(workout)
    .eq("id", id);
  if (wErr) throw wErr;

  // Replace the exercise set wholesale — simple and consistent with the
  // editor model where the client owns the working copy.
  const { error: delErr } = await supabase
    .from("exercises")
    .delete()
    .eq("workout_id", id);
  if (delErr) throw delErr;

  if (exercises.length > 0) {
    const rows = exercises.map((e, i) => ({ ...e, position: i, workout_id: id }));
    const { error: insErr } = await supabase.from("exercises").insert(rows);
    if (insErr) throw insErr;
  }

  revalidatePath("/");
  revalidatePath(`/workouts/${id}/edit`);
  revalidatePath(`/workouts/${id}/run`);
}

export async function deleteWorkout(id: string) {
  const { supabase } = await getUserId();
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
}

export async function duplicateWorkout(id: string) {
  const { supabase, userId } = await getUserId();

  const { data: source, error } = await supabase
    .from("workouts")
    .select("*, exercises(*)")
    .eq("id", id)
    .single();
  if (error) throw error;

  const { data: created, error: cErr } = await supabase
    .from("workouts")
    .insert({
      user_id: userId,
      name: `${source.name} (copy)`,
      rounds: source.rounds,
      rest_between_rounds: source.rest_between_rounds,
      cue_halfway: source.cue_halfway,
      cue_10s: source.cue_10s,
    })
    .select("id")
    .single();
  if (cErr) throw cErr;

  const exercises = (source.exercises as Array<Record<string, unknown>>) ?? [];
  if (exercises.length > 0) {
    const rows = exercises
      .slice()
      .sort((a, b) => (a.position as number) - (b.position as number))
      .map((e, i) => ({
        workout_id: created.id,
        position: i,
        name: e.name,
        type: e.type,
        duration_sec: e.duration_sec,
        reps: e.reps,
        rest_after_sec: e.rest_after_sec,
      }));
    const { error: insErr } = await supabase.from("exercises").insert(rows);
    if (insErr) throw insErr;
  }

  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Workout sessions (history)
// ---------------------------------------------------------------------------

export async function logSession(input: {
  workout_id: string | null;
  workout_name: string;
  started_at: string;
  total_duration_sec: number;
  rounds_completed: number;
  status: SessionStatus;
}) {
  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("workout_sessions").insert({
    user_id: userId,
    workout_id: input.workout_id,
    workout_name: input.workout_name,
    started_at: input.started_at,
    completed_at: new Date().toISOString(),
    total_duration_sec: input.total_duration_sec,
    rounds_completed: input.rounds_completed,
    status: input.status,
  });
  if (error) throw error;

  revalidatePath("/history");
}

export async function deleteSession(id: string) {
  const { supabase } = await getUserId();
  const { error } = await supabase
    .from("workout_sessions")
    .delete()
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/history");
}
