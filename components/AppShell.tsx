import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, CalendarCheck, ClipboardList, CreditCard, Flame, Settings } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard" aria-label="Dayforge dashboard">
          <span className="brandMark">
            <Flame size={22} />
          </span>
          <span>Dayforge</span>
        </Link>
        <nav className="nav" aria-label="Primary navigation">
          <Link href="/dashboard"><BarChart3 size={18} /><span>Dashboard</span></Link>
          <Link href="/check-in"><ClipboardList size={18} /><span>Check-in</span></Link>
          <Link href="/history"><CalendarCheck size={18} /><span>History</span></Link>
          <Link href="/billing"><CreditCard size={18} /><span>Billing</span></Link>
          <Link href="/settings"><Settings size={18} /><span>Settings</span></Link>
        </nav>
        <div style={{ marginTop: "auto" }}>
          <SignOutButton />
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
