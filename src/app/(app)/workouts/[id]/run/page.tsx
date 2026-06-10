import { notFound } from "next/navigation";
import { Runner } from "@/components/runner/runner";
import { getWorkout } from "@/lib/repo/workouts";

export const metadata = { title: "Workout" };

export default async function RunWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await getWorkout(id);
  if (!workout) notFound();
  if (workout.exercises.length === 0) notFound();
  return <Runner workout={workout} />;
}
