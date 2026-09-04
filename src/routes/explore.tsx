import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell, PageHeader } from "@/components/social/AppShell";
import { PostCard } from "@/components/social/PostCard";
import { FeedSkeleton } from "@/components/social/PostSkeleton";
import { DefaultRail, SearchBox } from "@/components/social/RightRail";
import { Avatar } from "@/components/social/Avatar";
import { getPosts, getTrendingTags, getUsers } from "@/lib/api-client";
import type { Post, Profile, TrendingTag } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): { tag?: string; q?: string } => ({
    ...(typeof search["tag"] === "string" ? { tag: search["tag"] as string } : {}),
    ...(typeof search["q"] === "string" ? { q: search["q"] as string } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Explore Trending Topics — Spaces" },
      { name: "description", content: "Discover trending hashtags, breakout creators and the most-discussed posts across Spaces." },
      { property: "og:title", content: "Explore Trending Topics — Spaces" },
      { property: "og:description", content: "Discover trending hashtags and breakout creators across Spaces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const { tag, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Profile[]>([]);

  useEffect(() => {
    setLoading(true);
    getPosts(tag ? { tag } : {})
      .then((rows) =>
        setPosts(
          q ? rows.filter((r) => r.content.toLowerCase().includes(q.toLowerCase())) : rows,
        ),
      )
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [tag, q]);

  useEffect(() => {
    if (!q) {
      setPeople([]);
      return;
    }
    const needle = q.toLowerCase();
    getUsers()
      .then((res) =>
        setPeople(
          res.profiles.filter(
            (p) =>
              p.username.toLowerCase().includes(needle) ||
              p.display_name.toLowerCase().includes(needle),
          ),
        ),
      )
      .catch(() => setPeople([]));
  }, [q]);

  useEffect(() => {
    getTrendingTags()
      .then((res) => setTags(res.trendingTags))
      .catch(() => {});
  }, []);

  return (
    <AppShell title="Explore" right={<DefaultRail />}>
      <PageHeader title="Explore" subtitle="Trending conversations happening right now" />
      <div className="mb-5 lg:hidden">
        <SearchBox />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => navigate({ search: {} })}
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-bold transition-colors",
            !tag ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-foreground/5",
          )}
        >
          All
        </button>
        {tags.map((t) => (
          <button
            key={t.tag}
            onClick={() => navigate({ search: { tag: t.tag } })}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-bold transition-colors",
              tag === t.tag ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-foreground/5",
            )}
          >
            #{t.tag}
          </button>
        ))}
      </div>

      {q ? (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-muted-foreground">
            People matching “{q}”
          </h2>
          {people.length === 0 ? (
            <p className="rounded-2xl border border-border/70 bg-card p-4 text-sm text-muted-foreground">
              No creators found.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {people.map((p) => (
                <a
                  key={p.id}
                  href={`/profile?user=${p.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 transition-colors hover:bg-foreground/5"
                >
                  <Avatar name={p.display_name} src={p.avatar_url} className="h-9 w-9 text-xs" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{p.display_name}</span>
                    <span className="block truncate text-xs text-muted-foreground">@{p.username}</span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-4">
        {loading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <p className="rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </p>
        ) : (
          posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
        )}
      </div>
    </AppShell>
  );
}
