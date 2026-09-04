import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageHeader, Panel } from "@/components/social/AppShell";
import { Avatar } from "@/components/social/Avatar";
import { TimeAgo } from "@/components/social/TimeAgo";
import { getNotifications, markNotificationsRead } from "@/lib/api-client";
import { useProfile } from "@/lib/profile-service";
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

function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    getNotifications()
      .then(setItems)
      .catch(() => setItems([]));
    markNotificationsRead().catch(() => {});
  }, []);

  return (
    <AppShell title="Notifications">
      <PageHeader title="Notifications" subtitle="Everything happening around you" />
      <Panel>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <Bell className="h-6 w-6" />
            <p className="text-sm">You're all caught up.</p>
          </div>
        ) : (
          items.map((n) => <NotificationRow key={n.id} notification={n} />)
        )}
      </Panel>
    </AppShell>
  );
}
