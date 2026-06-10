"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Play,
  Pencil,
  Copy,
  Trash2,
  MoreVertical,
  Clock,
  Repeat,
} from "lucide-react";
import { toast } from "sonner";
import type { WorkoutWithExercises } from "@/types";
import {
  deleteWorkout,
  duplicateWorkout,
} from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { estimateWorkoutDuration } from "@/lib/workout-stats";
import { formatDurationShort } from "@/lib/format";

export function WorkoutCard({ workout }: { workout: WorkoutWithExercises }) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const exerciseCount = workout.exercises.length;
  const totalSec = estimateWorkoutDuration(workout);

  function onDuplicate() {
    startTransition(async () => {
      try {
        await duplicateWorkout(workout.id);
        toast.success("Workout duplicated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not duplicate");
      }
    });
  }

  function onDelete() {
    setConfirmOpen(false);
    startTransition(async () => {
      try {
        await deleteWorkout(workout.id);
        toast.success("Workout deleted");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not delete");
      }
    });
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/workouts/${workout.id}/edit`}
            className="block truncate text-base font-semibold"
          >
            {workout.name}
          </Link>
          <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
            <span>{exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatDurationShort(totalSec)}
            </span>
            {workout.rounds > 1 ? (
              <span className="flex items-center gap-1">
                <Repeat className="size-3" />
                {workout.rounds}
              </span>
            ) : null}
          </div>
        </div>

        <Button
          render={<Link href={`/workouts/${workout.id}/run`} />}
          size="sm"
          disabled={exerciseCount === 0}
        >
          <Play className="size-3.5" />
          Run
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" disabled={pending}>
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={`/workouts/${workout.id}/edit`} />}>
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="size-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this workout?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{workout.name}&rdquo; and all of its exercises will be
              permanently deleted. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
