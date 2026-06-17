import { notFound } from "next/navigation";
import { Runner } from "@/components/runner/runner";
import { getWorkout } from "@/lib/repo/workouts";
import { getVoiceCueSettings, getBodyStats } from "@/app/(app)/actions";

export const metadata = { title: "Workout" };

export default async function RunWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [workout, cueSettings, bodyStats] = await Promise.all([
    getWorkout(id),
    getVoiceCueSettings(),
    getBodyStats(),
  ]);
  if (!workout) notFound();
  if (workout.exercises.length === 0) notFound();
  return <Runner workout={workout} cueSettings={cueSettings} bodyStats={bodyStats} />;
}
