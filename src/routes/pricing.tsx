import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

import { AppShell, PageHeader } from "@/components/social/AppShell";
import { UpgradeModal } from "@/components/social/UpgradeModal";
import { COMPARISON_PERKS, PLAN_DETAILS, type BillingCycle, type PlanTier } from "@/lib/plans";
import { openUpgradeModal, usePlan } from "@/lib/plan-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Plans & Perks — Spaces Pricing" },
      { name: "description", content: "Compare Spaces Free, Plus and Pro: AI drafting, HD audio rooms, monetization, custom branding, team workspaces and API access." },
      { property: "og:title", content: "Plans & Perks — Spaces Pricing" },
      { property: "og:description", content: "Compare Spaces Free, Plus and Pro creator plans and perks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { currentPlan } = usePlan();
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const tiers: PlanTier[] = ["free", "plus", "pro"];

  return (
    <AppShell title="Plans & Perks">
      <UpgradeModal />
      <PageHeader
        title="Plans & Perks"
        subtitle="Upgrade for AI drafting, HD live rooms, monetization and analytics"
      />

      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          {(["monthly", "annual"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={cn(
                "rounded-full px-5 py-2 text-xs font-bold capitalize transition-colors",
                cycle === c ? "bg-gradient-to-r from-brand to-brand-pink text-white" : "text-muted-foreground",
              )}
            >
              {c === "annual" ? "Annual (save 20%)" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {tiers.map((tier) => {
          const plan = PLAN_DETAILS[tier];
          const price = cycle === "annual" ? plan.priceAnnual : plan.priceMonthly;
          const isCurrent = currentPlan === tier;
          return (
            <div
              key={tier}
              className={cn(
                "flex flex-col rounded-3xl border bg-card p-6 shadow-soft",
                plan.popular ? "border-brand/60 shadow-glow" : "border-border/70",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">{plan.name}</h2>
                {plan.popular && (
                  <span className="flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-1 text-[0.65rem] font-black uppercase text-brand">
                    <Sparkles className="h-3 w-3" /> Popular
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{plan.tagline}</p>
              <p className="mt-4 text-3xl font-black">
                ${price}
                <span className="text-sm font-semibold text-muted-foreground">/mo</span>
              </p>

              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                onClick={() => openUpgradeModal(plan.name)}
                className={cn(
                  "mt-6 rounded-full px-5 py-2.5 text-xs font-bold transition-all",
                  isCurrent
                    ? "cursor-default bg-muted text-muted-foreground"
                    : "bg-gradient-to-r from-brand to-brand-pink text-white hover:brightness-105",
                )}
              >
                {isCurrent ? "Current plan" : plan.ctaText}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-border/70 bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Perk</th>
              <th className="px-4 py-3">Free</th>
              <th className="px-4 py-3">Plus</th>
              <th className="px-4 py-3">Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {COMPARISON_PERKS.map((perk: any) => (
              <tr key={perk.label ?? perk.name}>
                <td className="px-4 py-3 font-semibold">{perk.label ?? perk.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{String(perk.free)}</td>
                <td className="px-4 py-3 text-muted-foreground">{String(perk.plus)}</td>
                <td className="px-4 py-3 text-muted-foreground">{String(perk.pro)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
