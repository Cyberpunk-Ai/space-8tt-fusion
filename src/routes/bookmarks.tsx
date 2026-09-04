import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell, PageHeader } from "@/components/social/AppShell";
import { PostCard } from "@/components/social/PostCard";
import { FeedSkeleton } from "@/components/social/PostSkeleton";
import { getPosts } from "@/lib/api-client";
import { supabase } from "@/integrations/supabase/client";
import { currentUserId } from "@/lib/profile-service";
import type { Post } from "@/lib/types";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "Saved Posts — Spaces Bookmarks" },
      { name: "description", content: "Every post you have bookmarked on Spaces, saved privately for later reading." },
      { property: "og:title", content: "Saved Posts — Spaces Bookmarks" },
      { property: "og:description", content: "Your privately bookmarked Spaces posts, saved for later." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await (supabase as any)
          .from("bookmarks")
          .select("post_id")
          .eq("user_id", currentUserId);
        const ids = new Set((data ?? []).map((r: { post_id: string }) => r.post_id));
        const all = await getPosts({ limit: 100 });
        setPosts(all.filter((p) => ids.has(p.id)));
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell title="Bookmarks">
      <PageHeader title="Bookmarks" subtitle="Posts you saved for later" />
      <div className="space-y-4">
        {loading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <p className="rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
            You haven't saved anything yet.
          </p>
        ) : (
          posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
        )}
      </div>
    </AppShell>
  );
}
