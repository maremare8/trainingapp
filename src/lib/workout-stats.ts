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
