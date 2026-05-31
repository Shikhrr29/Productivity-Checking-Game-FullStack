"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/env";

export default function LoginPage() {
  const { isConfigured } = getSupabaseConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [next, setNext] = useState("/dashboard");

  useEffect(() => {
    setNext(new URLSearchParams(window.location.search).get("next") ?? "/dashboard");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!isConfigured) {
      setError("Supabase is not configured yet. Add your keys to .env.local, restart the dev server, then sign in.");
      return;
    }
    const supabase = createClient();
    const result =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/dashboard` }
          });

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setMessage("Check your email to confirm your account, then come back to sign in.");
      return;
    }

    window.location.href = next;
  }

  return (
    <div className="authPage">
      <section className="authHero">
        <div className="brand">
          <span className="brandMark"><Sparkles size={22} /></span>
          <span>Dayforge</span>
        </div>
        <div className="grid" style={{ maxWidth: 560 }}>
          <p className="eyebrow" style={{ color: "#e5d7b9" }}>Daily score. Real habits. Better momentum.</p>
          <h1>Turn work, training, food, and energy into a game you can actually keep playing.</h1>
          <p>Log the day in minutes, protect your streak, and learn what makes tomorrow easier.</p>
        </div>
      </section>
      <section className="authPanel">
        <div className="panel authCard">
          <div className="grid">
            <div>
              <p className="eyebrow">{mode === "sign-in" ? "Welcome back" : "Create account"}</p>
              <h2>{mode === "sign-in" ? "Sign in to your beta" : "Start tracking your days"}</h2>
            </div>
            {!isConfigured && (
              <div className="notice">
                Supabase keys are missing. Open <strong>/setup</strong> for the exact `.env.local` values you need to add before auth will work.
              </div>
            )}
            <form className="form" onSubmit={submit}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
              {error && <p className="error">{error}</p>}
              {message && <p className="notice">{message}</p>}
              <button className="button success" type="submit"><Mail size={17} />{mode === "sign-in" ? "Sign in" : "Create account"}</button>
            </form>
            <button className="button secondary" type="button" onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
              {mode === "sign-in" ? "Need an account?" : "Already have an account?"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
