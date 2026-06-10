import Link from "next/link";
import { Plus, Dumbbell } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkoutCard } from "@/components/workout/workout-card";
import { listWorkouts } from "@/lib/repo/workouts";

export default async function WorkoutsPage() {
  const workouts = await listWorkouts();

  return (
    <>
      <PageHeader
        title="Workouts"
        description="Your saved interval workouts."
        action={
          <Button render={<Link href="/workouts/new" />} size="sm">
            <Plus className="size-4" />
            New
          </Button>
        }
      />

      {workouts.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="bg-muted flex size-12 items-center justify-center rounded-full">
            <Dumbbell className="text-muted-foreground size-6" />
          </div>
          <div>
            <p className="font-medium">No workouts yet</p>
            <p className="text-muted-foreground text-sm">
              Create your first workout to get started.
            </p>
          </div>
          <Button render={<Link href="/workouts/new" />}>
            <Plus className="size-4" />
            New workout
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {workouts.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      )}
    </>
  );
}
