import { describe, expect, it } from "vitest";
import { calculateDailyScore, nextStreakCount, sleepToScore, updateGamification } from "@/lib/scoring";
import type { DailyLog } from "@/lib/types";

const baseLog: DailyLog = {
  log_date: "2026-05-22",
  work_score: 80,
  tasks_completed: 4,
  tasks_planned: 5,
  gym_status: "strong",
  diet_score: 75,
  energy_score: 70,
  mood_score: 80,
  sleep_hours: 7.5,
  reflection: "Good day"
};

describe("scoring", () => {
  it("keeps total score within 0-100 and stores components", () => {
    const score = calculateDailyScore(baseLog, 2);
    expect(score.total_score).toBeGreaterThan(0);
    expect(score.total_score).toBeLessThanOrEqual(100);
    expect(score.work_component).toBeLessThanOrEqual(40);
    expect(score.gym_component).toBeLessThanOrEqual(20);
    expect(score.diet_component).toBeLessThanOrEqual(20);
    expect(score.energy_component).toBeLessThanOrEqual(15);
    expect(score.consistency_bonus).toBeLessThanOrEqual(5);
  });

  it("does not fail the day when gym is missing", () => {
    const score = calculateDailyScore({ ...baseLog, gym_status: "none" });
    expect(score.gym_component).toBe(0);
    expect(score.total_score).toBeGreaterThan(50);
  });

  it("scores ideal sleep highest", () => {
    expect(sleepToScore(8)).toBe(100);
    expect(sleepToScore(4)).toBeLessThan(100);
  });
});

describe("gamification", () => {
  it("starts a streak on the first log", () => {
    const next = updateGamification(null, "2026-05-22", calculateDailyScore(baseLog));
    expect(next.current_streak).toBe(1);
    expect(next.longest_streak).toBe(1);
    expect(next.xp).toBeGreaterThan(0);
  });

  it("increments consecutive local-calendar days", () => {
    expect(nextStreakCount("2026-05-22", "2026-05-23", 3)).toBe(4);
  });

  it("resets after a missed day", () => {
    expect(nextStreakCount("2026-05-22", "2026-05-24", 3)).toBe(1);
  });
});
