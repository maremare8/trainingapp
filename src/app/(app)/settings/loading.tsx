import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <>
      <div className="mb-6">
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="flex flex-col gap-4">
        {/* Account card */}
        <Skeleton className="h-16 rounded-xl" />
        {/* Streak goal card */}
        <Skeleton className="h-24 rounded-xl" />
        {/* Voice cues card */}
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </>
  );
}
