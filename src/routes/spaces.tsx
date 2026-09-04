import { createFileRoute } from "@tanstack/react-router";
import { Radio, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageHeader, Panel } from "@/components/social/AppShell";
import { DefaultRail } from "@/components/social/RightRail";
import { SpaceRoomModal } from "@/components/social/SpaceRoomModal";
import { getSpaces } from "@/lib/api-client";
import { useRealtime } from "@/lib/realtime";
import type { Space } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/spaces")({
  validateSearch: (search: Record<string, unknown>): { spaceId?: string } =>
    typeof search["spaceId"] === "string" ? { spaceId: search["spaceId"] as string } : {},
  head: () => ({
    meta: [
      { title: "Live Audio Spaces — Spaces" },
      { name: "description", content: "Join live audio rooms, raise your hand to speak and catch AI recaps of every Spaces conversation." },
      { property: "og:title", content: "Live Audio Spaces — Spaces" },
      { property: "og:description", content: "Join live audio rooms and catch AI recaps of every conversation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpacesPage,
});

function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [active, setActive] = useState<Space | null>(null);

  useEffect(() => {
    getSpaces()
      .then((res) => setSpaces(res.spaces))
      .catch(() => setSpaces([]));
  }, []);

  useRealtime({
    "space:terminated": ({ id }: { id: string }) =>
      setSpaces((prev) => prev.map((s) => (s.id === id ? { ...s, live: false, is_live: false } : s))),
  });

  return (
    <AppShell title="Spaces" right={<DefaultRail />}>
      <PageHeader title="Spaces" subtitle="Live audio rooms from the community" />
      {spaces.length === 0 ? (
        <Panel>
          <p className="py-6 text-center text-sm text-muted-foreground">No rooms are live right now.</p>
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => setActive(space)}
              className="group overflow-hidden rounded-3xl border border-border/70 bg-card text-left shadow-soft transition-all hover:shadow-lift"
            >
              <div className={cn("h-20 bg-gradient-to-r", space.gradient)} />
              <div className="space-y-2 p-5">
                <div className="flex items-center gap-2">
                  {space.live && (
                    <span className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[0.65rem] font-black uppercase text-rose-500">
                      <Radio className="h-3 w-3" /> Live
                    </span>
                  )}
                  <span className="text-xs font-semibold text-muted-foreground">{space.topic}</span>
                </div>
                <h2 className="text-base font-extrabold">{space.title}</h2>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {space.listeners} listening
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <SpaceRoomModal space={active} isOpen={!!active} onClose={() => setActive(null)} />
    </AppShell>
  );
}
