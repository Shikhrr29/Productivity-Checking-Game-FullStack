import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dateInTimezone, todayInTimezone } from "@/lib/date";

type ReminderRow = {
  user_id: string;
  enabled: boolean;
  reminder_time: string;
  last_sent_at: string | null;
  profiles: {
    email: string;
    timezone: string;
    display_name: string | null;
  } | null;
};

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (process.env.REMINDER_CRON_SECRET && secret !== process.env.REMINDER_CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data = [], error } = await supabase
    .from("email_reminders")
    .select("user_id, enabled, reminder_time, last_sent_at, profiles(email, timezone, display_name)")
    .eq("enabled", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const reminders = (data ?? []) as unknown as ReminderRow[];
  const due = reminders.filter((row) => isDue(row));
  const sent: string[] = [];

  for (const row of due) {
    const today = todayInTimezone(row.profiles?.timezone);
    const { data: existing } = await supabase
      .from("daily_logs")
      .select("id")
      .eq("user_id", row.user_id)
      .eq("log_date", today)
      .maybeSingle();

    if (existing || !row.profiles?.email) continue;

    await sendReminderEmail(row.profiles.email, row.profiles.display_name ?? "there");
    await supabase.from("email_reminders").update({ last_sent_at: new Date().toISOString() }).eq("user_id", row.user_id);
    sent.push(row.user_id);
  }

  return NextResponse.json({ checked: reminders.length, sent: sent.length });
}

function isDue(row: ReminderRow) {
  const timezone = row.profiles?.timezone ?? "UTC";
  const now = new Date();
  const today = todayInTimezone(timezone);
  if (row.last_sent_at && dateInTimezone(new Date(row.last_sent_at), timezone) === today) {
    return false;
  }

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(now);

  return time >= row.reminder_time;
}

async function sendReminderEmail(email: string, name: string) {
  if (!process.env.RESEND_API_KEY) {
    console.info(`Reminder email skipped for ${email}; RESEND_API_KEY is not configured.`);
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Dayforge <reminders@dayforge.app>",
      to: email,
      subject: "Your Dayforge check-in is waiting",
      html: `<p>Hey ${name},</p><p>Your daily productivity check-in is still open. Log today to protect your streak and keep your trends honest.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/check-in">Open Dayforge</a></p>`
    })
  });
}
