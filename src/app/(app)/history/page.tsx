import { Flame, Activity, Clock, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listSessions } from "@/lib/repo/sessions";
import { computeStats } from "@/lib/history-stats";
import { formatDate, formatDuration, formatDurationShort } from "@/lib/format";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const sessions = await listSessions();
  const stats = computeStats(sessions);

  return (
    <>
      <PageHeader
        title="History"
        description="Completed sessions and streaks."
      />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame className="size-4" />}
          label="Current streak"
          value={`${stats.currentStreak} ${stats.currentStreak === 1 ? "day" : "days"}`}
          sub={
            stats.longestStreak > 0
              ? `Best: ${stats.longestStreak} ${stats.longestStreak === 1 ? "day" : "days"}`
              : undefined
          }
        />
        <StatCard
          icon={<CalendarDays className="size-4" />}
          label="This week"
          value={`${stats.thisWeekCount} ${stats.thisWeekCount === 1 ? "session" : "sessions"}`}
        />
        <StatCard
          icon={<Activity className="size-4" />}
          label="Total"
          value={`${stats.totalCompleted} done`}
          sub={
            stats.totalSessions > stats.totalCompleted
              ? `+ ${stats.totalSessions - stats.totalCompleted} aborted`
              : undefined
          }
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Total time"
          value={formatDurationShort(stats.totalSeconds)}
        />
      </div>

      {sessions.length === 0 ? (
        <Card className="text-muted-foreground px-6 py-12 text-center text-sm">
          Your completed workouts will show up here.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{s.workout_name}</div>
                  <div className="text-muted-foreground text-xs">
                    {formatDate(s.started_at)} · {formatDuration(s.total_duration_sec)}
                    {s.rounds_completed > 0
                      ? ` · ${s.rounds_completed} ${s.rounds_completed === 1 ? "round" : "rounds"}`
                      : ""}
                  </div>
                </div>
                {s.status === "aborted" ? (
                  <Badge variant="outline">Aborted</Badge>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {icon}
          {label}
        </div>
        <div className="mt-1 text-lg font-bold">{value}</div>
        {sub ? <div className="text-muted-foreground text-xs">{sub}</div> : null}
      </CardContent>
    </Card>
  );
}
