/**
 * Preset workout definitions available to all users.
 * These are copied into a user's workouts on first login or when
 * they tap "Restore presets" in settings.
 */

import type { ExerciseInput, WorkoutInput } from "@/types";

export interface PresetWorkout {
  workout: WorkoutInput;
  exercises: ExerciseInput[];
}

export const PRESET_WORKOUTS: PresetWorkout[] = [
  // ── BODYWEIGHT ──────────────────────────────────────────

  {
    workout: {
      name: "Flashpoint",
      rounds: 4,
      rest_between_rounds: 60,
      rest_between_exercises: 10,
      cue_halfway: true,
      cue_10s: true,
      intensity_override: null,
    },
    exercises: [
      { position: 0, name: "Jump Squats", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
      { position: 1, name: "Push-Ups", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
      { position: 2, name: "Mountain Climbers", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
      { position: 3, name: "Glute Bridges", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
    ],
  },

  {
    workout: {
      name: "Circuit Surge",
      rounds: 3,
      rest_between_rounds: 90,
      rest_between_exercises: 10,
      cue_halfway: true,
      cue_10s: true,
      intensity_override: null,
    },
    exercises: [
      { position: 0, name: "Jumping Jacks", type: "time", duration_sec: 35, reps: null, rest_after_sec: 10 },
      { position: 1, name: "Push-Ups", type: "time", duration_sec: 35, reps: null, rest_after_sec: 10 },
      { position: 2, name: "Jump Squats", type: "time", duration_sec: 35, reps: null, rest_after_sec: 10 },
      { position: 3, name: "Superman Holds", type: "time", duration_sec: 35, reps: null, rest_after_sec: 10 },
      { position: 4, name: "Alternating Reverse Lunges", type: "time", duration_sec: 35, reps: null, rest_after_sec: 10 },
      { position: 5, name: "Diamond Push-Ups", type: "time", duration_sec: 35, reps: null, rest_after_sec: 10 },
      { position: 6, name: "Bicycle Crunches", type: "time", duration_sec: 35, reps: null, rest_after_sec: 10 },
      { position: 7, name: "Burpees", type: "time", duration_sec: 35, reps: null, rest_after_sec: 10 },
    ],
  },

  {
    workout: {
      name: "Blaze Protocol",
      rounds: 4,
      rest_between_rounds: 30,
      rest_between_exercises: 15,
      cue_halfway: true,
      cue_10s: true,
      intensity_override: null,
    },
    exercises: [
      { position: 0, name: "High Knees", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 1, name: "Wide Push-Ups", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 2, name: "Jump Squats", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 3, name: "Prone Y-T Raises", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 4, name: "Reverse Lunge + Knee Drive (L)", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 5, name: "Reverse Lunge + Knee Drive (R)", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 6, name: "Pike Push-Ups", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 7, name: "Plank Shoulder Taps", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
    ],
  },

  // ── KETTLEBELL ──────────────────────────────────────────

  {
    workout: {
      name: "Iron Ignition",
      rounds: 4,
      rest_between_rounds: 60,
      rest_between_exercises: 10,
      cue_halfway: true,
      cue_10s: true,
      intensity_override: null,
    },
    exercises: [
      { position: 0, name: "KB Swings", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
      { position: 1, name: "Goblet Squat", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
      { position: 2, name: "KB Push Press", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
      { position: 3, name: "KB Romanian DL", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
    ],
  },

  {
    workout: {
      name: "Bell Forge",
      rounds: 3,
      rest_between_rounds: 60,
      rest_between_exercises: 15,
      cue_halfway: true,
      cue_10s: true,
      intensity_override: null,
    },
    exercises: [
      { position: 0, name: "KB Swings", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 1, name: "Goblet Squat", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 2, name: "KB Clean & Press (Left)", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 3, name: "KB Clean & Press (Right)", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 4, name: "KB Bent-Over Row", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 5, name: "KB Russian Twist", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 6, name: "KB Suitcase Deadlift", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
    ],
  },

  {
    workout: {
      name: "Forge Master",
      rounds: 4,
      rest_between_rounds: 45,
      rest_between_exercises: 15,
      cue_halfway: true,
      cue_10s: true,
      intensity_override: null,
    },
    exercises: [
      { position: 0, name: "KB Swings", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 1, name: "Goblet Squat", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 2, name: "KB Clean & Press (Left)", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 3, name: "KB Clean & Press (Right)", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 4, name: "KB Single-Arm Row (Left)", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 5, name: "KB Single-Arm Row (Right)", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 6, name: "KB Thruster", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 7, name: "KB Snatch (alternating)", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
    ],
  },

  // ── TRX + BODYWEIGHT ────────────────────────────────────

  {
    workout: {
      name: "Suspension Spark",
      rounds: 4,
      rest_between_rounds: 60,
      rest_between_exercises: 10,
      cue_halfway: true,
      cue_10s: true,
      intensity_override: null,
    },
    exercises: [
      { position: 0, name: "TRX Row", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
      { position: 1, name: "TRX Chest Press", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
      { position: 2, name: "Jump Squats", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
      { position: 3, name: "TRX Pike", type: "time", duration_sec: 20, reps: null, rest_after_sec: 10 },
    ],
  },

  {
    workout: {
      name: "Strap & Surge",
      rounds: 3,
      rest_between_rounds: 60,
      rest_between_exercises: 15,
      cue_halfway: true,
      cue_10s: true,
      intensity_override: null,
    },
    exercises: [
      { position: 0, name: "TRX Row", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 1, name: "TRX Chest Press", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 2, name: "TRX Squat", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 3, name: "Push-Ups", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 4, name: "TRX Hamstring Curl", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 5, name: "Mountain Climbers", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 6, name: "TRX Plank", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
    ],
  },

  {
    workout: {
      name: "Gravity Defiance",
      rounds: 4,
      rest_between_rounds: 45,
      rest_between_exercises: 15,
      cue_halfway: true,
      cue_10s: true,
      intensity_override: null,
    },
    exercises: [
      { position: 0, name: "TRX Row", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 1, name: "TRX Chest Press", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 2, name: "TRX Split Squat (Left)", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 3, name: "TRX Split Squat (Right)", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 4, name: "Burpees", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 5, name: "TRX Bicep Curl", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 6, name: "TRX Pike", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
      { position: 7, name: "Plank Shoulder Taps", type: "time", duration_sec: 40, reps: null, rest_after_sec: 15 },
    ],
  },
];
