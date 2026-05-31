"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Save } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [reminderTime, setReminderTime] = useState("20:30");
  const [enabled, setEnabled] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle();
      const { data: reminder } = await supabase.from("email_reminders").select("*").eq("user_id", userData.user.id).maybeSingle();
      setDisplayName(profile?.display_name ?? "");
      setTimezone(profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
      setReminderTime(reminder?.reminder_time ?? profile?.reminder_time ?? "20:30");
      setEnabled(reminder?.enabled ?? true);
    }
    load();
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    await supabase.from("profiles").update({ display_name: displayName, timezone, reminder_time: reminderTime }).eq("id", userData.user.id);
    await supabase.from("email_reminders").upsert({ user_id: userData.user.id, enabled, reminder_time: reminderTime });
    setStatus("Settings saved.");
  }

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Tune your daily loop</h1>
        </div>
      </div>
      <section className="panel">
        <form className="form" onSubmit={save}>
          <div className="grid two">
            <div className="field">
              <label htmlFor="displayName">Display name</label>
              <input id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="timezone">Timezone</label>
              <input id="timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="reminder">Reminder time</label>
              <input id="reminder" type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="enabled">Email reminders</label>
              <select id="enabled" value={String(enabled)} onChange={(event) => setEnabled(event.target.value === "true")}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>
          {status && <p className="notice">{status}</p>}
          <button className="button success" type="submit"><Save size={17} />Save settings</button>
        </form>
      </section>
    </AppShell>
  );
}
