import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell, PageHeader } from "@/components/social/AppShell";
import { AnalyticsDashboard } from "@/components/social/AnalyticsDashboard";
import { CustomBrandingSettings } from "@/components/social/CustomBrandingSettings";
import { DeveloperPortal } from "@/components/social/DeveloperPortal";
import { MonetizationHub } from "@/components/social/MonetizationHub";
import { PrioritySupportDesk } from "@/components/social/PrioritySupportDesk";
import { TeamWorkspaceManager } from "@/components/social/TeamWorkspaceManager";
import { UpgradeModal } from "@/components/social/UpgradeModal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Creator Settings — Spaces" },
      { name: "description", content: "Manage branding, monetization, analytics, team workspaces, API keys and priority support for your Spaces account." },
      { property: "og:title", content: "Creator Settings — Spaces" },
      { property: "og:description", content: "Manage branding, monetization, team workspaces and API access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const TABS = [
  { id: "branding", label: "Branding" },
  { id: "monetization", label: "Monetization" },
  { id: "analytics", label: "Analytics" },
  { id: "team", label: "Team" },
  { id: "developer", label: "Developers" },
  { id: "support", label: "Support" },
] as const;

function SettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("branding");

  return (
    <AppShell title="Settings">
      <UpgradeModal />
      <PageHeader title="Creator Settings" subtitle="Everything that powers your Spaces presence" />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-bold transition-colors",
              tab === t.id ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-foreground/5",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "branding" && <CustomBrandingSettings />}
      {tab === "monetization" && <MonetizationHub />}
      {tab === "analytics" && <AnalyticsDashboard />}
      {tab === "team" && <TeamWorkspaceManager />}
      {tab === "developer" && <DeveloperPortal />}
      {tab === "support" && <PrioritySupportDesk />}
    </AppShell>
  );
}
