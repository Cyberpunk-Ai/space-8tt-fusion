import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/social/AppShell";
import { Composer } from "@/components/social/Composer";
import { PostCard } from "@/components/social/PostCard";
import { FeedSkeleton } from "@/components/social/PostSkeleton";
import { DefaultRail } from "@/components/social/RightRail";
import { UpgradeModal } from "@/components/social/UpgradeModal";
import { getPosts } from "@/lib/api-client";
import { useRealtime } from "@/lib/realtime";
import type { Post } from "@/lib/types";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts({ limit: 50 })
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useRealtime({
    "post:created": (post: Post) => setPosts((prev) => [post, ...prev]),
    "post:deleted": ({ id }: { id: string }) => setPosts((prev) => prev.filter((p) => p.id !== id)),
  });

  return (
    <AppShell title="Home" right={<DefaultRail />}>
      <UpgradeModal />
      <Composer onPost={(created) => setPosts((prev) => [created, ...prev])} />
      <div className="mt-6 space-y-4">
        {loading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <p className="rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
            No posts yet — be the first to share something.
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
      </div>
    </AppShell>
  );
}
