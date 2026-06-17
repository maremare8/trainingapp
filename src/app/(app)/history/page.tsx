import { Flame, Activity, Clock, CalendarDays, Zap } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityGraph } from "@/components/history/activity-graph";
import { listSessions } from "@/lib/repo/sessions";
import { computeStats } from "@/lib/history-stats";
import { getStreakGoal } from "@/app/(app)/actions";
import { formatDate, formatDuration, formatDurationShort } from "@/lib/format";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const [sessions, goalDays] = await Promise.all([listSessions(), getStreakGoal()]);
  const stats = computeStats(sessions, goalDays);

  // Build activity-by-day map for the graph
  const activityByDay: Record<string, number> = {};
  for (const s of sessions) {
    const d = new Date(s.started_at);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    activityByDay[key] = (activityByDay[key] || 0) + 1;
  }

  return (
    <>
      <PageHeader title="History" />

      {/* Activity graph */}
      <div className="mb-5">
        <ActivityGraph activityByDay={activityByDay} />
      </div>

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
          value={`${stats.totalCompleted} completed`}
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Total time"
          value={formatDurationShort(stats.totalSeconds)}
        />
        {stats.totalCalories > 0 && (
          <StatCard
            icon={<Zap className="size-4" />}
            label="Total calories"
            value={`${stats.totalCalories} kcal`}
          />
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="text-muted-foreground px-6 py-12 text-center text-sm">
          Your completed workouts will show up here.
        </div>
      ) : (
        <div className="divide-border divide-y">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{s.workout_name}</div>
                <div className="text-muted-foreground text-xs">
                  {formatDate(s.started_at)} · {formatDuration(s.total_duration_sec)}
                  {s.rounds_completed > 0
                    ? ` · ${s.rounds_completed} ${s.rounds_completed === 1 ? "round" : "rounds"}`
                    : ""}
                  {s.calories_burned ? ` · ${s.calories_burned} kcal` : ""}
                </div>
              </div>
            </div>
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
