import { notFound } from "next/navigation";
import { WorkoutEditor } from "@/components/workout/workout-editor";
import { getWorkout } from "@/lib/repo/workouts";

export const metadata = { title: "Edit workout" };

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await getWorkout(id);
  if (!workout) notFound();
  return <WorkoutEditor workout={workout} />;
}
