"use client";

import { useMemo, useState } from "react";
import { Check, CreditCard, Download, ReceiptText, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { billingPlans, formatPlanPrice, type BillingCadence } from "@/lib/billing";

export default function BillingPage() {
  const [cadence, setCadence] = useState<BillingCadence>("monthly");
  const currentPlan = billingPlans[0];
  const selectedPriceLabel = useMemo(() => formatPlanPrice(currentPlan, cadence), [cadence, currentPlan]);

  return (
    <AppShell>
      <div className="topbar">
        <div>
          <p className="eyebrow">Billing</p>
          <h1>Plan and payments</h1>
        </div>
        <div className="billingToggle" aria-label="Billing cadence">
          <button type="button" data-active={cadence === "monthly"} onClick={() => setCadence("monthly")}>Monthly</button>
          <button type="button" data-active={cadence === "yearly"} onClick={() => setCadence("yearly")}>Yearly</button>
        </div>
      </div>

      <section className="panel billingSummary">
        <div className="billingSummaryIcon">
          <ShieldCheck size={24} />
        </div>
        <div>
          <p className="eyebrow">Current plan</p>
          <h2>{currentPlan.name}</h2>
          <p className="muted">{selectedPriceLabel} {cadence === "monthly" ? "per month" : "per year"}</p>
        </div>
        <button className="button secondary" type="button">
          <CreditCard size={17} />
          Manage payment
        </button>
      </section>

      <section className="grid three billingPlans" aria-label="Available plans">
        {billingPlans.map((plan) => {
          const priceLabel = formatPlanPrice(plan, cadence);
          const isCurrent = plan.id === currentPlan.id;

          return (
            <article className="card planCard" data-highlight={plan.highlight} key={plan.id}>
              <div className="grid">
                <div>
                  <div className="planHeader">
                    <h2>{plan.name}</h2>
                    {plan.highlight && <span className="pill">Popular</span>}
                  </div>
                  <p className="muted">{plan.description}</p>
                </div>
                <div className="planPrice">
                  <strong>{priceLabel}</strong>
                  <span className="muted">{cadence === "monthly" ? "/ month" : "/ year"}</span>
                </div>
                <ul className="planFeatures">
                  {plan.features.map((feature) => (
                    <li key={feature}><Check size={16} />{feature}</li>
                  ))}
                </ul>
              </div>
              <button className={`button ${plan.highlight ? "success" : "secondary"}`} type="button">
                <CreditCard size={17} />
                {isCurrent ? "Current plan" : "Choose plan"}
              </button>
            </article>
          );
        })}
      </section>

      <section className="grid two">
        <div className="panel grid">
          <div>
            <p className="eyebrow">Payment method</p>
            <h2>No card on file</h2>
          </div>
          <p className="muted">Add a payment method when checkout is connected.</p>
          <button className="button secondary" type="button">
            <CreditCard size={17} />
            Add card
          </button>
        </div>
        <div className="panel grid">
          <div>
            <p className="eyebrow">Invoices</p>
            <h2>Recent activity</h2>
          </div>
          <div className="invoiceRow">
            <span><ReceiptText size={17} />No invoices yet</span>
            <button className="iconButton secondary" type="button" aria-label="Download latest invoice">
              <Download size={17} />
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
