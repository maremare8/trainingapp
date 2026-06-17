// Domain types for the Tabata Timer app. These mirror the Supabase schema
// in supabase/schema.sql.

export type ExerciseType = "time" | "reps";

export type SessionStatus = "completed" | "aborted";

export interface Profile {
  id: string;
  display_name: string | null;
  streak_goal_days: number;
  cue_halfway: boolean;
  cue_10s: boolean;
  created_at: string;
}

export interface Exercise {
  id: string;
  workout_id: string;
  position: number;
  name: string;
  type: ExerciseType;
  /** Seconds, set when type === "time". */
  duration_sec: number | null;
  /** Rep count, set when type === "reps". */
  reps: number | null;
  /** Rest in seconds that follows this exercise. */
  rest_after_sec: number;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  rounds: number;
  rest_between_rounds: number;
  rest_between_exercises: number;
  cue_halfway: boolean;
  cue_10s: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutWithExercises extends Workout {
  exercises: Exercise[];
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string | null;
  workout_name: string;
  started_at: string;
  completed_at: string | null;
  total_duration_sec: number;
  rounds_completed: number;
  status: SessionStatus;
}

// Input shapes used when creating/editing (before the DB assigns ids/timestamps).
export type ExerciseInput = Pick<
  Exercise,
  "name" | "type" | "duration_sec" | "reps" | "rest_after_sec" | "position"
>;

export type WorkoutInput = Pick<
  Workout,
  "name" | "rounds" | "rest_between_rounds" | "rest_between_exercises" | "cue_halfway" | "cue_10s"
>;
