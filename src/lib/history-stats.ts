import type { WorkoutSession } from "@/types";

export interface SessionStats {
  totalCompleted: number;
  totalSeconds: number;
  totalCalories: number;
  currentStreak: number;
  longestStreak: number;
  thisWeekCount: number;
  /** Whether the user is on track with their streak goal right now. */
  onTrack: boolean;
}

/**
 * Compute streak based on the user's frequency goal.
 * A streak counts consecutive "windows" of `goalDays` where at least one session was completed.
 * E.g., with goalDays=2, you need at least 1 session every 2 days to maintain the streak.
 */
export function computeStats(
  sessions: WorkoutSession[],
  goalDays = 2
): SessionStats {
  const totalSeconds = sessions.reduce(
    (acc, s) => acc + s.total_duration_sec,
    0
  );

  const totalCalories = sessions.reduce(
    (acc, s) => acc + (s.calories_burned ?? 0),
    0
  );

  const dayKey = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;

  const days = new Set(sessions.map((s) => dayKey(new Date(s.started_at))));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check streak: walk backward in windows of goalDays.
  // A window is "met" if there's at least one session in that range.
  let currentStreak = 0;
  let cursor = new Date(today);

  // First check if the current window (ending today) has activity.
  // Give a grace period: check from (today - goalDays + 1) to today.
  function windowHasActivity(endDate: Date): boolean {
    for (let i = 0; i < goalDays; i++) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      if (days.has(dayKey(d))) return true;
    }
    return false;
  }

  // Walk backwards in windows
  while (windowHasActivity(cursor)) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - goalDays);
  }

  // Longest streak: sort all session days chronologically, then compute
  // max consecutive windows.
  const sortedDays = Array.from(days)
    .map((k) => new Date(`${k}T00:00:00`))
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 0;
  if (sortedDays.length > 0) {
    let run = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const gap = Math.round(
        (sortedDays[i].getTime() - sortedDays[i - 1].getTime()) / 86_400_000
      );
      if (gap <= goalDays) {
        run += 1;
      } else {
        longestStreak = Math.max(longestStreak, run);
        run = 1;
      }
    }
    longestStreak = Math.max(longestStreak, run);
  }

  // This week: sessions in the past 7 days.
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const thisWeekCount = sessions.filter(
    (s) => new Date(s.started_at) >= sevenDaysAgo
  ).length;

  // On track: is there a session within the last goalDays?
  const onTrack = windowHasActivity(new Date(today));

  return {
    totalCompleted: sessions.length,
    totalSeconds,
    totalCalories,
    currentStreak,
    longestStreak,
    thisWeekCount,
    onTrack,
  };
}
