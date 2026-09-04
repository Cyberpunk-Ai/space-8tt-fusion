import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/social/AppShell";
import { Composer } from "@/components/social/Composer";
import { PostCard } from "@/components/social/PostCard";
import { FeedSkeleton } from "@/components/social/PostSkeleton";
import { DefaultRail } from "@/components/social/RightRail";
import { StoriesRail } from "@/components/social/StoriesRail";
import { UpgradeModal } from "@/components/social/UpgradeModal";
import { getPosts } from "@/lib/api-client";
import { appConfig } from "@/lib/config";
import { useRealtime } from "@/lib/realtime";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "for-you", label: "For you" },
  { id: "following", label: "Following" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export const Route = createFileRoute("/feed")({
  validateSearch: (search: Record<string, unknown>): { compose?: string } =>
    typeof search["compose"] === "string" ? { compose: search["compose"] as string } : {},
  head: () => ({
    meta: [
      { title: "Home Feed — Spaces Social" },
      { name: "description", content: "Your personalised Spaces feed: posts, polls, media and live rooms from creators you follow." },
      { property: "og:title", content: "Home Feed — Spaces Social" },
      { property: "og:description", content: "Your personalised Spaces feed of creator posts, polls and live audio rooms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedPage,
});

export function FeedPage() {
  const [tab, setTab] = useState<TabId>("for-you");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async (nextTab: TabId) => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getPosts({
        limit: appConfig.feed.pageSize,
        following: nextTab === "following",
      });
      setPosts(rows);
      setExhausted(rows.length < appConfig.feed.pageSize);
    } catch {
      setError("We couldn't load the feed. Check your connection and try again.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || exhausted || posts.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = posts[posts.length - 1]?.created_at;
      const rows = await getPosts({
        limit: appConfig.feed.pageSize,
        following: tab === "following",
        ...(oldest ? { before: oldest } : {}),
      });
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...rows.filter((p) => !seen.has(p.id))];
      });
      if (rows.length < appConfig.feed.pageSize) setExhausted(true);
    } catch {
      setExhausted(true);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, exhausted, posts, tab]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  useRealtime({
    "post:created": (post: Post) =>
      setPosts((prev) => (prev.some((p) => p.id === post.id) ? prev : [post, ...prev])),
    "post:deleted": ({ id }: { id: string }) => setPosts((prev) => prev.filter((p) => p.id !== id)),
  });

  return (
    <AppShell title="Home" right={<DefaultRail />}>
      <UpgradeModal />
      <StoriesRail />

      <div
        role="tablist"
        aria-label="Feed filters"
        className="mb-4 flex gap-1 rounded-2xl border border-border/70 bg-card/70 p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200",
              tab === t.id
                ? "bg-gradient-to-r from-brand to-brand-pink text-white shadow-xs"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Composer onPost={(created) => setPosts((prev) => [created, ...prev])} />

      <div className="mt-6 space-y-4">
        {loading ? (
          <FeedSkeleton />
        ) : error ? (
          <div className="rounded-3xl border border-border/70 bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void load(tab)}
              className="mt-3 rounded-full bg-gradient-to-r from-brand to-brand-pink px-5 py-2 text-xs font-bold text-white"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <p className="rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
            {tab === "following"
              ? "Follow a few creators and their posts will land here."
              : "No posts yet — be the first to share something."}
          </p>
        ) : (
          posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
            />
          ))
        )}

        <div ref={sentinel} aria-hidden className="h-px" />
        {loadingMore ? (
          <p className="py-4 text-center text-xs font-semibold text-muted-foreground">
            Loading more…
          </p>
        ) : null}
        {exhausted && posts.length > 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">You're all caught up.</p>
        ) : null}
      </div>
    </AppShell>
  );
}
