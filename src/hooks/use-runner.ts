"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { buildSteps, planTotalSeconds, type RunnerStep } from "@/lib/runner/plan";
import { speak, stopSpeaking, warmUpSpeech } from "@/lib/speech";
import { beep, warmUpAudio } from "@/lib/beep";
import type { WorkoutWithExercises } from "@/types";

type Status = "idle" | "running" | "paused" | "finished";

interface State {
  steps: RunnerStep[];
  stepIndex: number;
  /** Milliseconds remaining for the current time-step. */
  remainingMs: number;
  status: Status;
  /** ms of elapsed run-time (not wall-clock), used for the session log. */
  elapsedMs: number;
  startedAt: string | null;
  cuesFiredForStep: { halfway: boolean; tenSec: boolean };
  /** Track which countdown beeps have been played (5, 4, 3, 2, 1) */
  beepsFiredForStep: Set<number>;
}

type Action =
  | { type: "START"; now: number }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "TICK"; delta: number }
  | { type: "ADVANCE" }
  | { type: "PREV" }
  | { type: "FIRE_CUE"; cue: "halfway" | "tenSec" }
  | { type: "FIRE_BEEP"; sec: number }
  | { type: "FINISH" };

function freshStepState(steps: RunnerStep[], stepIndex: number) {
  const step = steps[stepIndex];
  return {
    stepIndex,
    remainingMs: step.mode === "time" ? step.durationSec * 1000 : 0,
    cuesFiredForStep: { halfway: false, tenSec: false },
    beepsFiredForStep: new Set<number>(),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START": {
      if (state.steps.length === 0) return state;
      return {
        ...state,
        status: "running",
        startedAt: new Date(action.now).toISOString(),
        elapsedMs: 0,
        ...freshStepState(state.steps, 0),
      };
    }
    case "PAUSE":
      return state.status === "running" ? { ...state, status: "paused" } : state;
    case "RESUME":
      return state.status === "paused" ? { ...state, status: "running" } : state;
    case "TICK": {
      if (state.status !== "running") return state;
      const elapsedMs = state.elapsedMs + action.delta;
      const step = state.steps[state.stepIndex];
      if (step.mode !== "time") return { ...state, elapsedMs };
      const remainingMs = Math.max(0, state.remainingMs - action.delta);
      return { ...state, elapsedMs, remainingMs };
    }
    case "ADVANCE": {
      const nextIndex = state.stepIndex + 1;
      if (nextIndex >= state.steps.length) {
        return { ...state, status: "finished" };
      }
      return { ...state, ...freshStepState(state.steps, nextIndex) };
    }
    case "PREV": {
      const prevIndex = Math.max(0, state.stepIndex - 1);
      return { ...state, ...freshStepState(state.steps, prevIndex), status: "running" };
    }
    case "FIRE_CUE":
      return {
        ...state,
        cuesFiredForStep: { ...state.cuesFiredForStep, [action.cue]: true },
      };
    case "FIRE_BEEP":
      return {
        ...state,
        beepsFiredForStep: new Set([...state.beepsFiredForStep, action.sec]),
      };
    case "FINISH":
      return { ...state, status: "finished" };
    default:
      return state;
  }
}

export interface RunnerApi {
  status: Status;
  step: RunnerStep | null;
  stepIndex: number;
  stepCount: number;
  remainingSec: number;
  /** Progress 0..1 within the current step. */
  stepProgress: number;
  /** Progress 0..1 across the whole workout (by step index). */
  workoutProgress: number;
  elapsedSec: number;
  startedAt: string | null;
  totalPlanSec: number;
  isFinished: boolean;
  isMuted: boolean;

  start: () => void;
  pause: () => void;
  resume: () => void;
  advance: () => void;
  prev: () => void;
  completeReps: () => void;
  toggleMute: () => void;
}

export function useRunner(
  workout: WorkoutWithExercises,
  cueSettings?: { cue_halfway: boolean; cue_10s: boolean }
): RunnerApi {
  const steps = useMemo(() => buildSteps(workout), [workout]);
  const totalPlanSec = useMemo(() => planTotalSeconds(steps), [steps]);

  const [state, dispatch] = useReducer(reducer, undefined as unknown, () => ({
    steps,
    stepIndex: 0,
    remainingMs: steps[0]?.mode === "time" ? steps[0].durationSec * 1000 : 0,
    status: "idle" as Status,
    elapsedMs: 0,
    startedAt: null,
    cuesFiredForStep: { halfway: false, tenSec: false },
    beepsFiredForStep: new Set<number>(),
  }));

  const [isMuted, setIsMuted] = useState(false);
  const mutedRef = useRef(isMuted);
  mutedRef.current = isMuted;

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
  }, []);

  // Tick loop using rAF + performance.now for accuracy and battery-friendliness.
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.status !== "running") {
      lastTickRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    function frame(now: number) {
      const last = lastTickRef.current ?? now;
      const delta = now - last;
      lastTickRef.current = now;
      dispatch({ type: "TICK", delta });
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [state.status]);

  // Auto-advance timed steps when they hit zero.
  useEffect(() => {
    if (state.status !== "running") return;
    const step = state.steps[state.stepIndex];
    if (!step || step.mode !== "time") return;
    if (state.remainingMs <= 0) {
      dispatch({ type: "ADVANCE" });
    }
  }, [state.remainingMs, state.status, state.stepIndex, state.steps]);

  // Voice cue at halfway on timed exercise steps.
  useEffect(() => {
    if (state.status !== "running") return;
    const step = state.steps[state.stepIndex];
    if (!step || step.mode !== "time") return;

    const remSec = state.remainingMs / 1000;
    const dur = step.durationSec;

    // Halfway cue: only meaningful for longer timed exercises.
    if (
      (cueSettings?.cue_halfway ?? workout.cue_halfway) &&
      !state.cuesFiredForStep.halfway &&
      step.kind === "exercise" &&
      dur >= 20 &&
      remSec <= dur / 2 &&
      remSec > 5 // don't speak halfway right before the beeps
    ) {
      if (!mutedRef.current) speak("Halfway");
      dispatch({ type: "FIRE_CUE", cue: "halfway" });
    }
  }, [
    state.remainingMs,
    state.status,
    state.stepIndex,
    state.steps,
    state.cuesFiredForStep.halfway,
    cueSettings?.cue_halfway,
    workout.cue_halfway,
  ]);

  // Countdown beeps for last 5 seconds of each step (exercise or rest).
  useEffect(() => {
    if (state.status !== "running") return;
    const step = state.steps[state.stepIndex];
    if (!step || step.mode !== "time") return;
    if (step.kind === "prepare") return; // Skip prepare countdown

    const remSec = Math.ceil(state.remainingMs / 1000);
    
    // Beep at 5, 4, 3, 2, 1 seconds remaining
    if (remSec >= 1 && remSec <= 5 && !state.beepsFiredForStep.has(remSec)) {
      if (!mutedRef.current) {
        // Higher pitch for the final beep (1 second)
        const freq = remSec === 1 ? 1200 : 880;
        beep(freq, 100, 0.3);
      }
      dispatch({ type: "FIRE_BEEP", sec: remSec });
    }
  }, [state.remainingMs, state.status, state.stepIndex, state.steps, state.beepsFiredForStep]);

  // Stop speech when the workout finishes.
  useEffect(() => {
    if (state.status === "finished") stopSpeaking();
  }, [state.status]);

  // Public API
  const start = useCallback(() => {
    warmUpSpeech();
    warmUpAudio();
    dispatch({ type: "START", now: Date.now() });
  }, []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const resume = useCallback(() => dispatch({ type: "RESUME" }), []);
  const advance = useCallback(() => dispatch({ type: "ADVANCE" }), []);
  const prev = useCallback(() => dispatch({ type: "PREV" }), []);
  const completeReps = useCallback(() => dispatch({ type: "ADVANCE" }), []);

  const step = state.steps[state.stepIndex] ?? null;
  const remainingSec = step && step.mode === "time" ? Math.ceil(state.remainingMs / 1000) : 0;
  const stepProgress =
    step && step.mode === "time" && step.durationSec > 0
      ? 1 - state.remainingMs / (step.durationSec * 1000)
      : 0;
  const workoutProgress =
    state.steps.length > 0 ? state.stepIndex / state.steps.length : 0;

  return {
    status: state.status,
    step,
    stepIndex: state.stepIndex,
    stepCount: state.steps.length,
    remainingSec,
    stepProgress: Math.min(1, Math.max(0, stepProgress)),
    workoutProgress: Math.min(1, Math.max(0, workoutProgress)),
    elapsedSec: Math.floor(state.elapsedMs / 1000),
    startedAt: state.startedAt,
    totalPlanSec,
    isFinished: state.status === "finished",
    isMuted,
    start,
    pause,
    resume,
    advance,
    prev,
    completeReps,
    toggleMute,
  };
}
