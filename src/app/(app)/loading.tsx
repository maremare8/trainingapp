import { Skeleton } from "@/components/ui/skeleton";

export default function WorkoutsLoading() {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
      <div className="divide-border divide-y">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3.5">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </>
  );
}
