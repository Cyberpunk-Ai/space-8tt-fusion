import { createFileRoute } from "@tanstack/react-router";

import { AppShell, PageHeader, Panel } from "@/components/social/AppShell";
import { appConfig } from "@/lib/config";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Spaces" },
      {
        name: "description",
        content: "What Spaces collects, why we collect it, who can see it and the controls you have over your data.",
      },
      { property: "og:title", content: "Privacy Policy — Spaces" },
      { property: "og:description", content: "What Spaces collects and the controls you have over your data." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "What we collect",
    body: "Your account details (name, handle, email), the content you create — posts, stories, messages, room activity — and basic usage signals such as which posts were shown to you.",
  },
  {
    title: "Why we collect it",
    body: "To run the app: showing your feed, delivering messages, ranking what you see, keeping the community safe and supporting paid plans.",
  },
  {
    title: "Who can see it",
    body: "Posts, stories and profiles are visible to other members. Direct messages are visible only to the people in the conversation. Bookmarks and account settings are private to you.",
  },
  {
    title: "Sign-in providers",
    body: "If you continue with Google or Apple we receive your name and email address from them so we can create your account. We never receive your password.",
  },
  {
    title: "Your controls",
    body: "Edit or delete your content at any time, tune your feed in Settings, and ask us to delete your account and data entirely.",
  },
  {
    title: "Retention",
    body: "We keep your content while your account is active. When you delete something it is removed from the app, and deleted accounts are cleared from our systems.",
  },
];

function PrivacyPage() {
  return (
    <AppShell title="Privacy">
      <PageHeader title="Privacy Policy" subtitle="Last updated 6 September 2026" />
      <Panel className="space-y-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-base font-black">{s.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
        <p className="border-t border-border/60 pt-4 text-sm text-muted-foreground">
          Privacy requests go to{" "}
          <a className="font-bold text-brand hover:underline" href={`mailto:${appConfig.brand.supportEmail}`}>
            {appConfig.brand.supportEmail}
          </a>
          .
        </p>
      </Panel>
    </AppShell>
  );
}
