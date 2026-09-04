import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageHeader, Panel } from "@/components/social/AppShell";
import { Avatar } from "@/components/social/Avatar";
import { TimeAgo } from "@/components/social/TimeAgo";
import { getNotifications, markNotificationsRead } from "@/lib/api-client";
import { useProfile } from "@/lib/profile-service";
import { useRealtime } from "@/lib/realtime";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Spaces" },
      { name: "description", content: "Keep up with likes, comments, reposts, follows, tips and Space invites on Spaces." },
      { property: "og:title", content: "Notifications — Spaces" },
      { property: "og:description", content: "Likes, comments, follows, tips and Space invites in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationRow({ notification }: { notification: Notification }) {
  const actor = useProfile(notification.actor_id);
  return (
    <div className="flex items-start gap-3 border-b border-border/60 py-3.5 last:border-0">
      <Avatar name={actor?.display_name || "User"} src={actor?.avatar_url ?? null} className="h-9 w-9 text-xs" />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <strong>{actor?.display_name || "Someone"}</strong> {notification.body}
        </p>
        <TimeAgo iso={notification.created_at} className="text-xs text-muted-foreground" />
      </div>
      {!notification.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />}
    </div>
  );
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "follow", label: "Follows" },
  { id: "tip", label: "Tips" },
] as const;

function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  useEffect(() => {
    getNotifications()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useRealtime({
    "notification:created": (n: Notification) =>
      setItems((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev])),
  });

  const visible = items.filter((n) =>
    filter === "all" ? true : filter === "unread" ? !n.read : n.type === filter,
  );

  async function markAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await markNotificationsRead().catch(() => {});
  }

  return (
    <AppShell title="Notifications">
      <PageHeader title="Notifications" subtitle="Everything happening around you" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-bold transition-colors",
              filter === f.id
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:bg-foreground/5",
            )}
          >
            {f.label}
          </button>
        ))}
        {items.some((n) => !n.read) ? (
          <button
            onClick={() => void markAll()}
            className="ml-auto rounded-full px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand/10"
          >
            Mark all read
          </button>
        ) : null}
      </div>

      <Panel>
        {loading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl bg-foreground/5" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <Bell className="h-6 w-6" />
            <p className="text-sm">You're all caught up.</p>
          </div>
        ) : (
          visible.map((n) => <NotificationRow key={n.id} notification={n} />)
        )}
      </Panel>
    </AppShell>
  );
}
