import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <>
      <div className="mb-6">
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Activity graph placeholder */}
      <Skeleton className="mb-5 h-48 w-full rounded-xl" />

      {/* Stat cards */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Session list */}
      <div className="divide-border divide-y">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
