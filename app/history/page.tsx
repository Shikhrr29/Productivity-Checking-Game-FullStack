import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { formatDisplayDate } from "@/lib/date";
import { calculateDailyScore } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/server";
import type { DailyLog, DailyScore } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: logs = [] } = await supabase
    .from("daily_logs")
    .select("*, daily_scores(*)")
    .eq("user_id", userData.user!.id)
    .order("log_date", { ascending: false })
    .limit(60);

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">History</p>
          <h1>Review the days you have forged</h1>
        </div>
      </div>
      <section className="grid">
        {(logs as Array<DailyLog & { daily_scores?: DailyScore[] }>).length ? (
          (logs as Array<DailyLog & { daily_scores?: DailyScore[] }>).map((log) => {
            const score = log.daily_scores?.[0] ?? calculateDailyScore(log);
            return (
              <article className="panel grid two" key={log.id}>
                <div className="grid">
                  <div>
                    <p className="eyebrow">{formatDisplayDate(log.log_date)}</p>
                    <h2>{score.total_score}/100</h2>
                  </div>
                  <p className="muted">{log.reflection || "No reflection added."}</p>
                </div>
                <ScoreBreakdown score={score} />
              </article>
            );
          })
        ) : (
          <div className="panel grid">
            <h2>No days logged yet</h2>
            <p className="muted">Your calendar fills in as soon as you finish the first check-in.</p>
            <Link className="button success" href="/check-in">Create first check-in</Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
