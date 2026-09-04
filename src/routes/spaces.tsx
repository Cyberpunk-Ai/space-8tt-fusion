import { createFileRoute } from "@tanstack/react-router";
import { Plus, Radio, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageHeader, Panel } from "@/components/social/AppShell";
import { DefaultRail } from "@/components/social/RightRail";
import { SpaceRoomModal } from "@/components/social/SpaceRoomModal";
import { createSpace, getSpaces } from "@/lib/api-client";
import { appConfig } from "@/lib/config";
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
  const [filter, setFilter] = useState<"live" | "replays" | "all">("live");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");

  useEffect(() => {
    getSpaces()
      .then((res) => setSpaces(res.spaces))
      .catch(() => setSpaces([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = spaces.filter((s) =>
    filter === "all" ? true : filter === "live" ? s.live : !s.live,
  );

  async function handleCreate() {
    if (!title.trim()) return;
    try {
      const row = await createSpace({ title: title.trim(), topic: topic.trim() || "General" });
      setSpaces((prev) => [{ ...(row as Space), live: true }, ...prev]);
      setTitle("");
      setTopic("");
      setCreating(false);
    } catch {
      setCreating(false);
    }
  }

  useRealtime({
    "space:created": (space: Space) =>
      setSpaces((prev) => (prev.some((s) => s.id === space.id) ? prev : [space, ...prev])),
    "space:terminated": ({ id }: { id: string }) =>
      setSpaces((prev) => prev.map((s) => (s.id === id ? { ...s, live: false, is_live: false } : s))),
  });

  return (
    <AppShell title="Spaces" right={<DefaultRail />}>
      <PageHeader title="Spaces" subtitle="Live audio rooms from the community" />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(["live", "replays", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-bold capitalize transition-colors",
              filter === f
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:bg-foreground/5",
            )}
          >
            {f}
          </button>
        ))}
        {appConfig.features.spaces ? (
          <button
            onClick={() => setCreating((v) => !v)}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-pink px-4 py-1.5 text-xs font-bold text-white shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Start a Space
          </button>
        ) : null}
      </div>

      {creating ? (
        <Panel className="mb-5">
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is this Space about?"
              className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic (e.g. Design, Web3)"
              className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCreating(false)}
                className="rounded-full px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-foreground/5"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleCreate()}
                disabled={!title.trim()}
                className="rounded-full bg-gradient-to-r from-brand to-brand-pink px-5 py-2 text-xs font-bold text-white disabled:opacity-40"
              >
                Go live
              </button>
            </div>
          </div>
        </Panel>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-3xl border border-border/70 bg-card" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Panel>
          <p className="py-6 text-center text-sm text-muted-foreground">
            {filter === "replays" ? "No recorded Spaces yet." : "No rooms are live right now."}
          </p>
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((space) => (
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
