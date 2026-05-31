"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Save } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Calcutta");
  const [reminderTime, setReminderTime] = useState("20:30");
  const [goals, setGoals] = useState("Deep work, train consistently, eat clean.");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      display_name: displayName,
      timezone,
      reminder_time: reminderTime,
      goals
    });
    await supabase.from("email_reminders").upsert({
      user_id: data.user.id,
      enabled: true,
      reminder_time: reminderTime
    });

    window.location.href = "/dashboard";
  }

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Onboarding</p>
          <h1>Set your daily game board</h1>
        </div>
      </div>
      <section className="panel">
        <form className="form" onSubmit={save}>
          <div className="grid two">
            <div className="field">
              <label htmlFor="name">Display name</label>
              <input id="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="timezone">Timezone</label>
              <input id="timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="reminder">Daily check-in reminder</label>
              <input id="reminder" type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="goals">Starting goals</label>
              <input id="goals" value={goals} onChange={(event) => setGoals(event.target.value)} />
            </div>
          </div>
          {status && <p className="notice">{status}</p>}
          <button className="button success" type="submit"><Save size={17} />Save and enter dashboard</button>
        </form>
      </section>
    </AppShell>
  );
}
