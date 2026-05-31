import Link from "next/link";
import { Database, FileKey, Play } from "lucide-react";

export default function SetupPage() {
  return (
    <div className="authPage">
      <section className="authHero">
        <div className="brand">
          <span className="brandMark"><Database size={22} /></span>
          <span>Dayforge</span>
        </div>
        <div className="grid" style={{ maxWidth: 560 }}>
          <p className="eyebrow" style={{ color: "#e5d7b9" }}>Supabase setup required</p>
          <h1>Connect your database before using the beta.</h1>
          <p>The app is built and running, but auth and saved daily logs need your Supabase project keys.</p>
        </div>
      </section>
      <section className="authPanel">
        <div className="panel authCard grid">
          <div>
            <p className="eyebrow">Local setup</p>
            <h2>Add these values to `.env.local`</h2>
          </div>
          <pre className="codeBlock">{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REMINDER_CRON_SECRET=choose_a_random_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000`}</pre>
          <div className="grid">
            <div className="card">
              <h3><FileKey size={17} /> Then run the SQL schema</h3>
              <p className="muted">Paste `supabase/schema.sql` into the Supabase SQL editor to create tables, constraints, and row-level security policies.</p>
            </div>
            <div className="card">
              <h3><Play size={17} /> Restart the dev server</h3>
              <p className="muted">Environment variables are loaded when Next starts, so restart `npm run dev` or the running dev process after saving `.env.local`.</p>
            </div>
          </div>
          <Link className="button secondary" href="/login">Back to login</Link>
        </div>
      </section>
    </div>
  );
}
