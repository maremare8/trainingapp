import type { WorkoutWithExercises } from "@/types";

export type StepKind = "prepare" | "exercise" | "rest";
export type StepMode = "time" | "reps";

export interface RunnerStep {
  kind: StepKind;
  /** Label shown as the current activity (e.g. exercise name, "Rest", "Get ready"). */
  label: string;
  /** What's coming up after this step (or null if it's the last). */
  nextLabel: string | null;
  mode: StepMode;
  /** Duration in seconds for time-mode steps. 0 for reps steps. */
  durationSec: number;
  /** Reps count for reps-mode steps. */
  reps: number;
  /** 1-based round number this step belongs to. */
  round: number;
  /** Total rounds. */
  totalRounds: number;
  /** Index of this step in the overall plan (0-based). */
  index: number;
  /** Equipment used for this exercise step (empty for rest/prepare). */
  equipment: string[];
}

const PREPARE_SEC = 5;

/**
 * Expand a workout into a flat list of runner steps, including the optional
 * prepare countdown at the start and rest steps between exercises / rounds.
 *
 * Trailing rest_after on the last exercise of the last round is dropped — we
 * don't want to count down to nothing once the workout is "done".
 */
export function buildSteps(workout: WorkoutWithExercises): RunnerStep[] {
  const steps: RunnerStep[] = [];
  const totalRounds = Math.max(1, workout.rounds);
  const exercises = workout.exercises;
  if (exercises.length === 0) return steps;

  steps.push({
    kind: "prepare",
    label: "Get ready",
    nextLabel: exercises[0].name,
    mode: "time",
    durationSec: PREPARE_SEC,
    reps: 0,
    round: 1,
    totalRounds,
    index: 0,
    equipment: [],
  });

  for (let r = 1; r <= totalRounds; r++) {
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const isLastExercise = i === exercises.length - 1;
      const isLastRound = r === totalRounds;

      let nextLabel: string | null = null;
      if (!isLastExercise) {
        nextLabel =
          ex.rest_after_sec > 0
            ? `Rest · ${exercises[i + 1].name}`
            : exercises[i + 1].name;
      } else if (!isLastRound) {
        nextLabel =
          workout.rest_between_rounds > 0
            ? `Rest · Round ${r + 1}`
            : `Round ${r + 1}`;
      } else {
        nextLabel = "Workout complete";
      }

      steps.push({
        kind: "exercise",
        label: ex.name,
        nextLabel,
        mode: ex.type,
        durationSec: ex.type === "time" ? Math.max(1, ex.duration_sec ?? 0) : 0,
        reps: ex.type === "reps" ? Math.max(1, ex.reps ?? 0) : 0,
        round: r,
        totalRounds,
        index: steps.length,
        equipment: ex.equipment ?? [],
      });

      // Rest after the exercise (skipped after the very last exercise of the
      // very last round — and after the last exercise of a round, since the
      // between-rounds rest covers that gap instead).
      if (!isLastExercise && ex.rest_after_sec > 0) {
        steps.push({
          kind: "rest",
          label: "Rest",
          nextLabel: exercises[i + 1].name,
          mode: "time",
          durationSec: ex.rest_after_sec,
          reps: 0,
          round: r,
          totalRounds,
          index: steps.length,
          equipment: [],
        });
      }
    }

    if (r < totalRounds && workout.rest_between_rounds > 0) {
      steps.push({
        kind: "rest",
        label: "Round break",
        nextLabel: `Round ${r + 1} · ${exercises[0].name}`,
        mode: "time",
        durationSec: workout.rest_between_rounds,
        reps: 0,
        round: r,
        totalRounds,
        index: steps.length,
        equipment: [],
      });
    }
  }

  return steps.map((s, i) => ({ ...s, index: i }));
}

/**
 * Sum of all timed-step durations + a flat estimate for any rep-based steps.
 */
export function planTotalSeconds(steps: RunnerStep[]): number {
  return steps.reduce(
    (acc, s) => acc + (s.mode === "time" ? s.durationSec : 30),
    0
  );
}
