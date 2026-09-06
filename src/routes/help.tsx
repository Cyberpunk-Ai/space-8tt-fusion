import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, LifeBuoy, Mail, MessageSquare, Radio, Shield, Zap } from "lucide-react";

import { AppShell, PageHeader, Panel } from "@/components/social/AppShell";
import { appConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Centre — Spaces" },
      {
        name: "description",
        content:
          "Answers about posting, live audio rooms, messages, bookmarks, plans, tipping and account safety on Spaces.",
      },
      { property: "og:title", content: "Help Centre — Spaces" },
      { property: "og:description", content: "Guides and answers for getting the most out of Spaces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpPage,
});

const guides = [
  { icon: Zap, title: "Getting started", body: "Create your profile, follow a few creators and post your first update from the Compose button." },
  { icon: Radio, title: "Live audio rooms", body: "Open Spaces to join a live room, raise your hand to speak, or start your own room in one tap." },
  { icon: MessageSquare, title: "Messages", body: "Direct messages support text, images and quick replies. Start one from any profile." },
  { icon: Shield, title: "Safety & reporting", body: "Every post, story and profile has a report option. Our moderators review reports around the clock." },
];

const faqs = [
  {
    q: "How do I change my plan?",
    a: "Open Plans & Perks, pick the tier you want and confirm. Your new perks unlock instantly and you can switch between monthly and annual billing or cancel any time from Settings.",
  },
  {
    q: "Why can't I sign in after registering?",
    a: "New accounts get a confirmation email. Click the link in that message, then sign in. You can also continue with Google or Apple to skip the email step entirely.",
  },
  {
    q: "Who can see my bookmarks?",
    a: "Only you. Bookmarks are private and never shown on your profile or to your followers.",
  },
  {
    q: "How does tipping work?",
    a: "Tap the tip button on a post or profile and choose an amount. Creators see tips in their monetisation hub.",
  },
  {
    q: "Can I delete my account?",
    a: `Yes — email ${appConfig.brand.supportEmail} from your registered address and we'll remove your account and content.`,
  },
];

function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <AppShell title="Help">
      <PageHeader title="Help Centre" subtitle="Short answers to the things people ask us most." />

      <div className="grid gap-4 sm:grid-cols-2">
        {guides.map(({ icon: Icon, title, body }) => (
          <Panel key={title}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-pink text-white">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-base font-black">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </Panel>
        ))}
      </div>

      <Panel className="mt-5">
        <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-muted-foreground">
          Frequently asked
        </h2>
        <ul className="divide-y divide-border/60">
          {faqs.map((f, i) => (
            <li key={f.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-bold"
              >
                {f.q}
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open === i && "rotate-180")} />
              </button>
              {open === i && <p className="pb-4 text-sm text-muted-foreground">{f.a}</p>}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LifeBuoy className="h-5 w-5 text-brand" />
          <div>
            <p className="text-sm font-black">Still stuck?</p>
            <p className="text-xs text-muted-foreground">Our team replies within one business day.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`mailto:${appConfig.brand.supportEmail}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-pink px-5 py-2 text-xs font-bold text-white"
          >
            <Mail className="h-3.5 w-3.5" /> Email support
          </a>
          <Link
            to="/settings"
            className="rounded-full border border-border/70 px-5 py-2 text-xs font-bold text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            Account settings
          </Link>
        </div>
      </Panel>
    </AppShell>
  );
}
