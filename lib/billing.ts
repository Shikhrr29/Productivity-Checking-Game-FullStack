export type BillingCadence = "monthly" | "yearly";

export type BillingPlan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlight?: boolean;
  features: string[];
};

export const billingPlans: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Core daily tracking for a personal productivity loop.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["Daily check-ins", "Score breakdown", "7-day trends", "Email reminders"]
  },
  {
    id: "pro",
    name: "Pro",
    description: "Deeper momentum tracking for consistent solo operators.",
    monthlyPrice: 9,
    yearlyPrice: 90,
    highlight: true,
    features: ["Everything in Starter", "30-day trends", "Rule-based insights", "Priority reminder delivery"]
  },
  {
    id: "coach",
    name: "Coach",
    description: "Shared accountability for coaching or small teams.",
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: ["Everything in Pro", "Shared progress review", "Team-ready reporting", "Priority support"]
  }
];

export function formatPlanPrice(plan: BillingPlan, cadence: BillingCadence) {
  const price = cadence === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  if (price === 0) return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);
}
