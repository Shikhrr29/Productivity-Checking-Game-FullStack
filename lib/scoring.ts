import type { DailyLog, DailyScore, GamificationState, Insight } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateDailyScore(log: DailyLog, previousStreak = 0): DailyScore {
  const taskRatio = log.tasks_planned > 0 ? log.tasks_completed / log.tasks_planned : 0;
  const workBase = (log.work_score * 0.65 + clampScore(taskRatio * 100) * 0.35) * 0.4;
  const gymBase = (log.gym_status === "strong" ? 100 : log.gym_status === "light" ? 65 : 0) * 0.2;
  const dietBase = log.diet_score * 0.2;
  const recoveryBase = ((log.energy_score + log.mood_score + sleepToScore(log.sleep_hours)) / 3) * 0.15;
  const consistencyBonus = previousStreak > 0 ? Math.min(5, 2 + previousStreak) : 0;

  return {
    total_score: clampScore(workBase + gymBase + dietBase + recoveryBase + consistencyBonus),
    work_component: clampScore(workBase),
    gym_component: clampScore(gymBase),
    diet_component: clampScore(dietBase),
    energy_component: clampScore(recoveryBase),
    consistency_bonus: clampScore(consistencyBonus)
  };
}

export function sleepToScore(hours: number) {
  if (hours <= 0) return 0;
  if (hours >= 7 && hours <= 9) return 100;
  if (hours < 7) return clampScore((hours / 7) * 100);
  return clampScore(100 - (hours - 9) * 12);
}

export function levelFromXp(xp: number) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}

export function updateGamification(
  previous: GamificationState | null,
  logDate: string,
  score: DailyScore,
  recentAverage = 0
): GamificationState {
  const state = previous ?? {
    current_streak: 0,
    longest_streak: 0,
    xp: 0,
    level: 1,
    last_logged_date: null
  };

  const nextStreak = nextStreakCount(state.last_logged_date, logDate, state.current_streak);
  const balancedBonus = score.work_component >= 24 && score.gym_component >= 13 && score.diet_component >= 13 ? 20 : 0;
  const improvementBonus = recentAverage > 0 && score.total_score > recentAverage ? 15 : 0;
  const streakBonus = nextStreak > state.current_streak ? Math.min(30, nextStreak * 5) : 0;
  const xp = state.xp + 50 + balancedBonus + improvementBonus + streakBonus;

  return {
    current_streak: nextStreak,
    longest_streak: Math.max(state.longest_streak, nextStreak),
    xp,
    level: levelFromXp(xp),
    last_logged_date: logDate
  };
}

export function nextStreakCount(previousDate: string | null, logDate: string, currentStreak: number) {
  if (!previousDate) return 1;
  if (previousDate === logDate) return Math.max(1, currentStreak);

  const diff = Math.round((dateOnly(logDate).getTime() - dateOnly(previousDate).getTime()) / DAY_MS);
  return diff === 1 ? currentStreak + 1 : 1;
}

export function generateInsights(logs: Array<DailyLog & { daily_scores?: DailyScore[] }>): Insight[] {
  if (logs.length < 4) return [];

  const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date));
  const start = sorted[0].log_date;
  const end = sorted[sorted.length - 1].log_date;
  const withScores = sorted.map((log) => ({
    ...log,
    total: log.daily_scores?.[0]?.total_score ?? calculateDailyScore(log).total_score
  }));
  const avg = average(withScores.map((log) => log.total));
  const gymAvg = average(withScores.filter((log) => log.gym_status !== "none").map((log) => log.total));
  const noGymAvg = average(withScores.filter((log) => log.gym_status === "none").map((log) => log.total));
  const lowDietDays = withScores.filter((log) => log.diet_score < 60 && log.energy_score < 65).length;

  const insights: Insight[] = [];

  if (gymAvg && noGymAvg && gymAvg - noGymAvg >= 8) {
    insights.push({
      type: "gym_lift",
      title: "Training days are carrying momentum",
      body: `Your gym days average ${Math.round(gymAvg)} versus ${Math.round(noGymAvg)} on non-gym days.`,
      source_period_start: start,
      source_period_end: end
    });
  }

  if (lowDietDays >= 2) {
    insights.push({
      type: "diet_energy",
      title: "Diet dips are showing up in energy",
      body: "Lower diet scores are repeatedly landing on lower-energy days.",
      source_period_start: start,
      source_period_end: end
    });
  }

  insights.push({
    type: "weekly_average",
    title: "Your recent baseline is visible",
    body: `Your average productivity score across this period is ${Math.round(avg)}.`,
    source_period_start: start,
    source_period_end: end
  });

  return insights.slice(0, 3);
}

function sleepDate(value: string) {
  return `${value}T00:00:00.000Z`;
}

function dateOnly(value: string) {
  return new Date(sleepDate(value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
