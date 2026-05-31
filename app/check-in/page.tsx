"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Save } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { todayInTimezone } from "@/lib/date";
import { calculateDailyScore, generateInsights, updateGamification } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/client";
import type { DailyLog, DailyScore, GamificationState, GymStatus } from "@/lib/types";

const defaultLog: DailyLog = {
  log_date: "",
  work_score: 70,
  tasks_completed: 3,
  tasks_planned: 5,
  gym_status: "none",
  diet_score: 70,
  energy_score: 70,
  mood_score: 70,
  sleep_hours: 7,
  reflection: ""
};

export default function CheckInPage() {
  const [log, setLog] = useState<DailyLog>(defaultLog);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const score = useMemo(() => calculateDailyScore(log), [log]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: profile } = await supabase.from("profiles").select("timezone").eq("id", userData.user.id).maybeSingle();
      const today = todayInTimezone(profile?.timezone);
      const { data: existing } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("log_date", today)
        .maybeSingle();
      if (!cancelled) {
        setLog(existing ?? { ...defaultLog, log_date: today });
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof DailyLog>(key: K, value: DailyLog[K]) {
    setLog((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving your day...");
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    const { data: previousGame } = await supabase.from("gamification_state").select("*").eq("user_id", user.id).maybeSingle();
    const { data: recentLogs = [] } = await supabase
      .from("daily_logs")
      .select("*, daily_scores(*)")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(7);
    const recentScores = (recentLogs as Array<DailyLog & { daily_scores?: DailyScore[] }>).flatMap((item) => item.daily_scores ?? []);
    const recentAverage = recentScores.length ? recentScores.reduce((sum, item) => sum + item.total_score, 0) / recentScores.length : 0;

    const { data: savedLog, error } = await supabase
      .from("daily_logs")
      .upsert({ ...log, user_id: user.id }, { onConflict: "user_id,log_date" })
      .select()
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }

    const nextScore = calculateDailyScore(savedLog, previousGame?.current_streak ?? 0);
    await supabase.from("daily_scores").upsert({ ...nextScore, user_id: user.id, log_id: savedLog.id }, { onConflict: "log_id" });

    const nextGame = updateGamification(previousGame as GamificationState | null, savedLog.log_date, nextScore, recentAverage);
    await supabase.from("gamification_state").upsert({ ...nextGame, user_id: user.id });

    const { data: allLogs = [] } = await supabase
      .from("daily_logs")
      .select("*, daily_scores(*)")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(14);
    const insights = generateInsights(allLogs as Array<DailyLog & { daily_scores?: DailyScore[] }>);
    if (insights.length) {
      await supabase.from("insights").insert(insights.map((insight) => ({ ...insight, user_id: user.id })));
    }

    window.location.href = "/dashboard";
  }

  if (loading) {
    return <AppShell><section className="panel">Loading check-in...</section></AppShell>;
  }

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Daily check-in</p>
          <h1>Score the habits that shaped today</h1>
        </div>
      </div>
      <section className="grid two">
        <form className="panel form" onSubmit={submit}>
          <div className="grid two">
            <NumberField label="Work focus" value={log.work_score} onChange={(value) => update("work_score", value)} />
            <NumberField label="Diet quality" value={log.diet_score} onChange={(value) => update("diet_score", value)} />
            <NumberField label="Energy" value={log.energy_score} onChange={(value) => update("energy_score", value)} />
            <NumberField label="Mood" value={log.mood_score} onChange={(value) => update("mood_score", value)} />
            <div className="field">
              <label htmlFor="planned">Tasks planned</label>
              <input id="planned" type="number" min={0} value={log.tasks_planned} onChange={(event) => update("tasks_planned", Number(event.target.value))} />
            </div>
            <div className="field">
              <label htmlFor="completed">Tasks completed</label>
              <input id="completed" type="number" min={0} value={log.tasks_completed} onChange={(event) => update("tasks_completed", Number(event.target.value))} />
            </div>
            <div className="field">
              <label htmlFor="sleep">Sleep hours</label>
              <input id="sleep" type="number" min={0} max={14} step={0.5} value={log.sleep_hours} onChange={(event) => update("sleep_hours", Number(event.target.value))} />
            </div>
            <div className="field">
              <label>Gym</label>
              <div className="segmented">
                {(["none", "light", "strong"] as GymStatus[]).map((value) => (
                  <button className="segment" data-active={log.gym_status === value} key={value} type="button" onClick={() => update("gym_status", value)}>
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="field">
            <label htmlFor="reflection">Reflection</label>
            <textarea id="reflection" value={log.reflection} onChange={(event) => update("reflection", event.target.value)} placeholder="What helped? What should tomorrow protect?" />
          </div>
          {status && <p className="notice">{status}</p>}
          <button className="button success" type="submit"><Save size={17} />Save check-in</button>
        </form>
        <aside className="panel grid">
          <div>
            <p className="eyebrow">Preview</p>
            <h2>{score.total_score}/100</h2>
          </div>
          <ScoreBreakdown score={score} />
        </aside>
      </section>
    </AppShell>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="range" min={0} max={100} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <strong>{value}</strong>
    </div>
  );
}
