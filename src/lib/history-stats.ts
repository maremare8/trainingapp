import type { WorkoutSession } from "@/types";

export interface SessionStats {
  totalCompleted: number;
  totalSessions: number;
  totalSeconds: number;
  currentStreak: number;
  longestStreak: number;
  thisWeekCount: number;
}

/**
 * Compute streak (consecutive days with at least one completed session,
 * counted from today / yesterday backwards) and other aggregate stats.
 */
export function computeStats(sessions: WorkoutSession[]): SessionStats {
  const completed = sessions.filter((s) => s.status === "completed");

  const totalSeconds = completed.reduce(
    (acc, s) => acc + s.total_duration_sec,
    0
  );

  // Set of YYYY-MM-DD strings (local time) on which the user completed a session.
  const dayKey = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  };
  const days = new Set(completed.map((s) => dayKey(s.started_at)));

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Current streak: include today if there's a session today; otherwise start
  // from yesterday (so missing today doesn't immediately break a streak built
  // earlier in the week).
  let currentStreak = 0;
  const cursor = new Date(today);
  if (!days.has(dayKey(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor.toISOString()))) {
      currentStreak = 0;
    }
  }
  while (days.has(dayKey(cursor.toISOString()))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak across all completed days.
  const sortedDays = Array.from(days)
    .map((k) => new Date(`${k}T00:00:00`))
    .sort((a, b) => a.getTime() - b.getTime());
  let longestStreak = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of sortedDays) {
    if (
      prev &&
      Math.round((d.getTime() - prev.getTime()) / 86_400_000) === 1
    ) {
      run += 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    prev = d;
  }

  // This week: completed sessions in the past 7 days.
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const thisWeekCount = completed.filter(
    (s) => new Date(s.started_at) >= sevenDaysAgo
  ).length;

  return {
    totalCompleted: completed.length,
    totalSessions: sessions.length,
    totalSeconds,
    currentStreak,
    longestStreak,
    thisWeekCount,
  };
}
