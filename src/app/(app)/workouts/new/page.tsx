import { WorkoutEditor } from "@/components/workout/workout-editor";
import { getBodyStats } from "@/app/(app)/actions";

export const metadata = { title: "New workout" };

export default async function NewWorkoutPage() {
  const bodyStats = await getBodyStats();
  return <WorkoutEditor bodyStats={bodyStats} />;
}
