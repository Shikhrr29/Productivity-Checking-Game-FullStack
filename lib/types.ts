export type GymStatus = "none" | "light" | "strong";

export type DailyLog = {
  id?: string;
  user_id?: string;
  log_date: string;
  work_score: number;
  tasks_completed: number;
  tasks_planned: number;
  gym_status: GymStatus;
  diet_score: number;
  energy_score: number;
  mood_score: number;
  sleep_hours: number;
  reflection: string;
  created_at?: string;
  updated_at?: string;
};

export type DailyScore = {
  total_score: number;
  work_component: number;
  gym_component: number;
  diet_component: number;
  energy_component: number;
  consistency_bonus: number;
};

export type GamificationState = {
  current_streak: number;
  longest_streak: number;
  xp: number;
  level: number;
  last_logged_date: string | null;
};

export type Insight = {
  type: string;
  title: string;
  body: string;
  source_period_start: string;
  source_period_end: string;
};
