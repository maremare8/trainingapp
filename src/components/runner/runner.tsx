"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pause,
  Play,
  SkipForward,
  SkipBack,
  X,
  Check,
  Trophy,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRunner } from "@/hooks/use-runner";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { logSession } from "@/app/(app)/actions";
import { formatDuration } from "@/lib/format";
import { stopSpeaking } from "@/lib/speech";
import { estimateCalories } from "@/lib/calories";
import { splitWorkRestTime } from "@/lib/workout-stats";
import { cn } from "@/lib/utils";
import type { WorkoutWithExercises } from "@/types";

export function Runner({
  workout,
  cueSettings,
  bodyStats,
}: {
  workout: WorkoutWithExercises;
  cueSettings?: { cue_halfway: boolean; cue_10s: boolean };
  bodyStats?: { weight_kg: number | null; sex: "male" | "female" | null };
}) {
  const router = useRouter();
  const runner = useRunner(workout, cueSettings);
  useWakeLock(runner.status === "running");

  const [confirmAbortOpen, setConfirmAbortOpen] = useState(false);
  const loggedRef = useRef(false);

  // Pre-compute calorie estimate from workout plan
  const { workSec, restSec } = splitWorkRestTime(
    workout.exercises,
    workout.rounds,
    workout.rest_between_rounds
  );
  const canEstimateKcal = !!(bodyStats?.weight_kg && bodyStats?.sex);
  const plannedKcal = canEstimateKcal
    ? estimateCalories({
        workTimeSec: workSec,
        restTimeSec: restSec,
        weightKg: bodyStats!.weight_kg!,
        sex: bodyStats!.sex!,
        intensityOverride: workout.intensity_override,
      })
    : null;

  // Log a completed session exactly once when the workout finishes.
  useEffect(() => {
    if (!runner.isFinished || loggedRef.current) return;
    if (!runner.startedAt) return;
    loggedRef.current = true;

    // Compute actual calories from elapsed time (scale planned estimate)
    let actualKcal: number | undefined;
    if (canEstimateKcal && plannedKcal && runner.totalPlanSec > 0) {
      const ratio = runner.elapsedSec / runner.totalPlanSec;
      actualKcal = Math.round(plannedKcal * ratio);
    }

    logSession({
      workout_id: workout.id,
      workout_name: workout.name,
      started_at: runner.startedAt,
      total_duration_sec: runner.elapsedSec,
      rounds_completed: workout.rounds,
      status: "completed",
      calories_burned: actualKcal,
    }).catch(() => {
      // History logging is best-effort — failure shouldn't break the UI.
    });
  }, [
    runner.isFinished,
    runner.startedAt,
    runner.elapsedSec,
    runner.totalPlanSec,
    workout.id,
    workout.name,
    workout.rounds,
    canEstimateKcal,
    plannedKcal,
  ]);

  // Clear any pending speech on unmount.
  useEffect(() => () => stopSpeaking(), []);

  function abort() {
    setConfirmAbortOpen(false);
    stopSpeaking();
    router.replace("/");
  }

  // ---------- Idle screen ----------
  if (runner.status === "idle") {
    return (
      <RunnerScreen onClose={() => router.back()}>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-wide">
              Ready to run
            </p>
            <h1 className="mt-2 text-3xl font-bold">{workout.name}</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {workout.exercises.length} exercises · {workout.rounds}{" "}
              {workout.rounds === 1 ? "round" : "rounds"} ·{" "}
              {formatDuration(runner.totalPlanSec)}
              {plannedKcal !== null ? ` · ~${plannedKcal} kcal` : ""}
            </p>
          </div>
          <Button
            size="lg"
            className="size-32 rounded-full text-lg"
            onClick={runner.start}
          >
            <Play className="size-8" />
            Start
          </Button>
        </div>
      </RunnerScreen>
    );
  }

  // ---------- Finished screen ----------
  if (runner.isFinished) {
    return (
      <RunnerScreen onClose={() => router.replace("/")}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="bg-primary/10 flex size-20 items-center justify-center rounded-full">
            <Trophy className="text-primary size-10" />
          </div>
          <h1 className="text-3xl font-bold">Workout complete</h1>
          <p className="text-muted-foreground">
            {formatDuration(runner.elapsedSec)} ·{" "}
            {workout.rounds} {workout.rounds === 1 ? "round" : "rounds"}
            {canEstimateKcal && plannedKcal && runner.totalPlanSec > 0
              ? ` · ${Math.round(plannedKcal * (runner.elapsedSec / runner.totalPlanSec))} kcal`
              : ""}
          </p>
          <Button onClick={() => router.replace("/")} className="mt-4">
            Done
          </Button>
        </div>
      </RunnerScreen>
    );
  }

  // ---------- Running / paused ----------
  const step = runner.step!;
  const isRest = step.kind === "rest" || step.kind === "prepare";
  const isReps = step.mode === "reps";
  const isPaused = runner.status === "paused";

  return (
    <RunnerScreen
      onClose={() => setConfirmAbortOpen(true)}
      tone={isRest ? "rest" : "work"}
      topLeft={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={runner.toggleMute}
          className="text-white hover:bg-white/10 hover:text-white"
          aria-label={runner.isMuted ? "Unmute" : "Mute"}
        >
          {runner.isMuted ? <VolumeOff className="size-5" /> : <Volume2 className="size-5" />}
        </Button>
      }
    >
      <div className="flex flex-1 flex-col">
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            Round {step.round} / {step.totalRounds}
          </span>
          <span>{formatDuration(runner.elapsedSec)}</span>
        </div>
        <Progress value={runner.workoutProgress * 100} className="mt-2 h-1" />

        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-xs uppercase tracking-widest text-white/70">
            {step.kind === "prepare"
              ? "Get ready"
              : step.kind === "rest"
              ? "Rest"
              : isReps
              ? "Reps"
              : "Work"}
          </p>
          <h1
            className={cn(
              "text-3xl font-bold leading-tight tracking-tight",
              "max-w-[16ch] break-words text-balance"
            )}
          >
            {step.label}
          </h1>

          {isReps ? (
            <div className="text-7xl font-bold tabular-nums">{step.reps}</div>
          ) : (
            <div className="text-8xl font-bold tabular-nums">
              {runner.remainingSec}
            </div>
          )}

          {!isReps ? (
            <Progress
              value={runner.stepProgress * 100}
              className="w-40 [&>div]:bg-white/80"
            />
          ) : null}

          {step.nextLabel ? (
            <p className="text-sm text-white/70">Up next: {step.nextLabel}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-around pb-2">
          <ControlButton onClick={runner.prev} label="Previous">
            <SkipBack className="size-6" />
          </ControlButton>

          {isReps ? (
            <Button
              size="lg"
              onClick={runner.completeReps}
              className="size-20 rounded-full"
            >
              <Check className="size-8" />
              <span className="sr-only">Done</span>
            </Button>
          ) : isPaused ? (
            <Button
              size="lg"
              onClick={runner.resume}
              className="size-20 rounded-full"
            >
              <Play className="size-8" />
              <span className="sr-only">Resume</span>
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              onClick={runner.pause}
              className="size-20 rounded-full"
            >
              <Pause className="size-8" />
              <span className="sr-only">Pause</span>
            </Button>
          )}

          <ControlButton onClick={runner.advance} label="Skip">
            <SkipForward className="size-6" />
          </ControlButton>
        </div>
      </div>

      <AlertDialog open={confirmAbortOpen} onOpenChange={setConfirmAbortOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will not be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction
              onClick={abort}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              End workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RunnerScreen>
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={onClick}
      className="text-white hover:bg-white/10 hover:text-white"
      aria-label={label}
    >
      {children}
    </Button>
  );
}

function RunnerScreen({
  children,
  onClose,
  tone,
  topLeft,
}: {
  children: React.ReactNode;
  onClose: () => void;
  tone?: "work" | "rest";
  topLeft?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col text-white",
        tone === "rest"
          ? "bg-emerald-600"
          : tone === "work"
          ? "bg-zinc-900"
          : "bg-zinc-900"
      )}
      style={{
        paddingTop: "max(env(safe-area-inset-top), 1rem)",
        paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
      }}
    >
      <div className="flex items-center justify-between px-4">
        <div>{topLeft}</div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-white hover:bg-white/10 hover:text-white"
          aria-label="Close runner"
        >
          <X className="size-5" />
        </Button>
      </div>
      <div className="flex flex-1 flex-col px-6 pb-2">{children}</div>
    </div>
  );
}
