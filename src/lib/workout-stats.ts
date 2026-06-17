import type { Exercise, WorkoutWithExercises } from "@/types";

/**
 * Estimated total duration of a workout, in seconds.
 *
 * Rep-based exercises have no fixed duration so they're estimated as 30s each
 * (used only for the at-a-glance summary on the list page). Rest-after-rounds
 * is counted between rounds, not after the final round.
 */
export function estimateWorkoutDuration(workout: WorkoutWithExercises): number {
  return estimate(workout.exercises, workout.rounds, workout.rest_between_rounds);
}

export function estimateExercisesDuration(exercises: Exercise[]): number {
  return estimate(exercises, 1, 0);
}

function estimate(exercises: Exercise[], rounds: number, restBetween: number) {
  const perRound = exercises.reduce((acc, ex, i) => {
    const work =
      ex.type === "time" ? ex.duration_sec ?? 0 : REP_ESTIMATE_PER_EX;
    const isLast = i === exercises.length - 1;
    return acc + work + (isLast ? 0 : ex.rest_after_sec);
  }, 0);
  const restRounds = Math.max(0, rounds - 1) * restBetween;
  return perRound * Math.max(1, rounds) + restRounds;
}

const REP_ESTIMATE_PER_EX = 30;

/**
 * Split total workout time into work vs rest seconds (for calorie estimation).
 */
export function splitWorkRestTime(
  exercises: Exercise[],
  rounds: number,
  restBetweenRounds: number
): { workSec: number; restSec: number } {
  let workPerRound = 0;
  let restPerRound = 0;

  exercises.forEach((ex, i) => {
    const work =
      ex.type === "time" ? ex.duration_sec ?? 0 : REP_ESTIMATE_PER_EX;
    workPerRound += work;
    const isLast = i === exercises.length - 1;
    if (!isLast) restPerRound += ex.rest_after_sec;
  });

  const r = Math.max(1, rounds);
  const restRounds = Math.max(0, rounds - 1) * restBetweenRounds;

  return {
    workSec: workPerRound * r,
    restSec: restPerRound * r + restRounds,
  };
}

/**
 * Variant that works with DraftExercise-like objects (same shape as Exercise
 * but without id/workout_id/created_at).
 */
export function splitWorkRestTimeDraft(
  items: Array<{
    type: "time" | "reps";
    duration_sec: number | null;
    reps: number | null;
  }>,
  rounds: number,
  restBetweenExercises: number,
  restBetweenRounds: number
): { workSec: number; restSec: number } {
  let workPerRound = 0;
  let restPerRound = 0;

  items.forEach((it, i) => {
    const work =
      it.type === "time" ? it.duration_sec ?? 0 : REP_ESTIMATE_PER_EX;
    workPerRound += work;
    const isLast = i === items.length - 1;
    if (!isLast) restPerRound += restBetweenExercises;
  });

  const r = Math.max(1, rounds);
  const restRounds = Math.max(0, rounds - 1) * restBetweenRounds;

  return {
    workSec: workPerRound * r,
    restSec: restPerRound * r + restRounds,
  };
}
