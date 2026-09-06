import { createFileRoute } from "@tanstack/react-router";

import { AppShell, PageHeader, Panel } from "@/components/social/AppShell";
import { appConfig } from "@/lib/config";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Spaces" },
      {
        name: "description",
        content: "The rules for using Spaces: your account, your content, acceptable use, plans and billing.",
      },
      { property: "og:title", content: "Terms of Service — Spaces" },
      { property: "og:description", content: "The rules for using Spaces, your account and your content." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "1. Your account",
    body: "You must be 13 or older to use Spaces. Keep your login details private — you are responsible for activity on your account. Tell us straight away if you believe someone else has access.",
  },
  {
    title: "2. Your content",
    body: "You keep ownership of everything you post. By posting you give us permission to store and display that content so the app can show it to the people you shared it with.",
  },
  {
    title: "3. Acceptable use",
    body: "No harassment, hate speech, spam, impersonation, illegal material or attempts to break the service. We may remove content or suspend accounts that break these rules.",
  },
  {
    title: "4. Live audio rooms",
    body: "Rooms are hosted by members, not by us. Hosts are responsible for their rooms and can remove participants. Recording a room without telling participants is not allowed.",
  },
  {
    title: "5. Plans and billing",
    body: "Paid plans renew automatically until cancelled. You can change or cancel your plan at any time in Settings, and access continues until the end of the paid period.",
  },
  {
    title: "6. Ending your access",
    body: "You can stop using Spaces whenever you like. We may suspend accounts that repeatedly break these terms or put other members at risk.",
  },
  {
    title: "7. Changes",
    body: "If we make meaningful changes to these terms we will let you know in the app before they take effect.",
  },
];

function TermsPage() {
  return (
    <AppShell title="Terms">
      <PageHeader title="Terms of Service" subtitle="Last updated 6 September 2026" />
      <Panel className="space-y-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-base font-black">{s.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
        <p className="border-t border-border/60 pt-4 text-sm text-muted-foreground">
          Questions? Write to{" "}
          <a className="font-bold text-brand hover:underline" href={`mailto:${appConfig.brand.supportEmail}`}>
            {appConfig.brand.supportEmail}
          </a>
          .
        </p>
      </Panel>
    </AppShell>
  );
}
