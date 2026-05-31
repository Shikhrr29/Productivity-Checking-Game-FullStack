import Link from "next/link";
import type { CSSProperties } from "react";
import { Trophy, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { TrendBars } from "@/components/TrendBars";
import { todayInTimezone } from "@/lib/date";
import { calculateDailyScore } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/server";
import type { DailyLog, DailyScore, GamificationState, Insight } from "@/lib/types";

type ScoreRow = DailyScore & { log_date?: string };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) {
    return (
      <AppShell>
        <section className="panel grid">
          <p className="eyebrow">One minute setup</p>
          <h1>Finish onboarding to start your streak</h1>
          <p className="muted">Set your timezone and reminder time so the app scores the right day.</p>
          <Link className="button success" href="/onboarding">Start onboarding</Link>
        </section>
      </AppShell>
    );
  }

  const today = todayInTimezone(profile.timezone);
  const { data: logs = [] } = await supabase
    .from("daily_logs")
    .select("*, daily_scores(*)")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(30);
  const { data: game } = await supabase.from("gamification_state").select("*").eq("user_id", user.id).maybeSingle();
  const { data: insights = [] } = await supabase.from("insights").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3);

  const dailyLogs = [...(logs as Array<DailyLog & { daily_scores?: DailyScore[] }>)].reverse();
  const todayLog = dailyLogs.find((log) => log.log_date === today);
  const todayScore = todayLog?.daily_scores?.[0] ?? (todayLog ? calculateDailyScore(todayLog, game?.current_streak ?? 0) : null);
  const trendScores: ScoreRow[] = dailyLogs.map((log) => ({ ...(log.daily_scores?.[0] ?? calculateDailyScore(log)), log_date: log.log_date }));
  const average30 = trendScores.length ? Math.round(trendScores.reduce((sum, score) => sum + score.total_score, 0) / trendScores.length) : 0;

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>{todayLog ? "Today is logged" : "Forge today before it fades"}</h1>
        </div>
        <Link className="button success" href="/check-in">{todayLog ? "Edit check-in" : "Start check-in"}</Link>
      </div>

      <section className="panel scoreHero">
        <div className="scoreRing" style={{ "--score": todayScore?.total_score ?? 0 } as CSSProperties}>
          <div className="scoreInner">
            <div>
              <div className="scoreNumber">{todayScore?.total_score ?? "--"}</div>
              <p className="muted">Today score</p>
            </div>
          </div>
        </div>
        <div className="grid">
          <div>
            <span className="pill"><Zap size={15} />Level {(game as GamificationState | null)?.level ?? 1}</span>
            <h2 style={{ marginTop: 10 }}>Work, body, food, and energy in one score.</h2>
          </div>
          {todayScore ? <ScoreBreakdown score={todayScore} /> : <p className="notice">No check-in yet today. Complete one to update your streak, XP, and score breakdown.</p>}
        </div>
      </section>

      <section className="grid three">
        <div className="card metric"><span className="muted">Current streak</span><strong>{game?.current_streak ?? 0} days</strong></div>
        <div className="card metric"><span className="muted">XP</span><strong>{game?.xp ?? 0}</strong></div>
        <div className="card metric"><span className="muted">30-day average</span><strong>{average30 || "--"}</strong></div>
      </section>

      <section className="grid two">
        <div className="panel grid">
          <div>
            <p className="eyebrow">Momentum</p>
            <h2>Last 7 logged days</h2>
          </div>
          <TrendBars scores={trendScores} />
        </div>
        <div className="panel grid">
          <div>
            <p className="eyebrow">Insights</p>
            <h2>What the pattern says</h2>
          </div>
          {(insights as Insight[]).length ? (
            (insights as Insight[]).map((insight) => (
              <div className="card" key={`${insight.type}-${insight.source_period_end}`}>
                <h3>{insight.title}</h3>
                <p className="muted">{insight.body}</p>
              </div>
            ))
          ) : (
            <p className="notice">Log at least four days to unlock your first rule-based insights.</p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
