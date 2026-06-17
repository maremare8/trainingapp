"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Period = "week" | "month" | "year";

interface ActivityGraphProps {
  /** Map of YYYY-MM-DD → number of sessions on that day. */
  activityByDay: Record<string, number>;
}

export function ActivityGraph({ activityByDay }: ActivityGraphProps) {
  const [period, setPeriod] = useState<Period>("week");

  const days = getDays(period);
  const maxCount = Math.max(1, ...days.map((d) => activityByDay[d] || 0));

  return (
    <div className="flex flex-col gap-3">
      {/* Period toggle */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(["week", "month", "year"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              period === p
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p === "week" ? "7 days" : p === "month" ? "30 days" : "Year"}
          </button>
        ))}
      </div>

      {/* Graph */}
      {period === "year" ? (
        <YearGrid activityByDay={activityByDay} days={days} />
      ) : (
        <BarChart days={days} activityByDay={activityByDay} maxCount={maxCount} period={period} />
      )}
    </div>
  );
}

function BarChart({
  days,
  activityByDay,
  maxCount,
  period,
}: {
  days: string[];
  activityByDay: Record<string, number>;
  maxCount: number;
  period: Period;
}) {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-1" style={{ height: 80 }}>
        {days.map((day) => {
          const count = activityByDay[day] || 0;
          const height = count > 0 ? Math.max(12, (count / maxCount) * 100) : 6;
          const isToday = day === toDateKey(new Date());
          return (
            <div
              key={day}
              className="flex flex-1 flex-col items-center"
              title={`${formatLabel(day)}: ${count} session${count !== 1 ? "s" : ""}`}
            >
              <div
                className={cn(
                  "w-full rounded-sm transition-all",
                  count > 0 ? "bg-foreground" : "bg-muted",
                  isToday && count === 0 && "bg-border"
                )}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      {/* Day labels for week view */}
      {period === "week" && (
        <div className="flex gap-1">
          {days.map((day) => {
            const d = new Date(day + "T00:00:00");
            return (
              <div key={day} className="text-muted-foreground flex-1 text-center text-[10px]">
                {dayLabels[d.getDay()]}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function YearGrid({
  activityByDay,
  days,
}: {
  activityByDay: Record<string, number>;
  days: string[];
}) {
  const maxCount = Math.max(1, ...days.map((d) => activityByDay[d] || 0));

  return (
    <div className="flex flex-wrap gap-[3px]">
      {days.map((day) => {
        const count = activityByDay[day] || 0;
        const intensity = count > 0 ? Math.min(count / maxCount, 1) : 0;
        return (
          <div
            key={day}
            className={cn(
              "size-2.5 rounded-[2px]",
              intensity === 0 && "bg-muted",
              intensity > 0 && intensity <= 0.25 && "bg-foreground/20",
              intensity > 0.25 && intensity <= 0.5 && "bg-foreground/40",
              intensity > 0.5 && intensity <= 0.75 && "bg-foreground/60",
              intensity > 0.75 && "bg-foreground/90"
            )}
            title={`${formatLabel(day)}: ${count}`}
          />
        );
      })}
    </div>
  );
}

function getDays(period: Period): string[] {
  const now = new Date();
  const count = period === "week" ? 7 : period === "month" ? 30 : 365;
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

function formatLabel(dateKey: string): string {
  const [, m, d] = dateKey.split("-");
  return `${d}/${m}`;
}
