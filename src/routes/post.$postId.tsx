import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { AppShell, Panel } from "@/components/social/AppShell";
import { Avatar } from "@/components/social/Avatar";
import { UserBadge } from "@/components/social/UserBadge";
import { PostCard } from "@/components/social/PostCard";
import { TimeAgo } from "@/components/social/TimeAgo";
import { DefaultRail } from "@/components/social/RightRail";
import { addPostComment, getPost, getPostComments } from "@/lib/api-client";
import { getProfile } from "@/lib/profile-service";
import { useAuth } from "@/lib/auth-state";
import type { Post, PostComment } from "@/lib/types";

export const Route = createFileRoute("/post/$postId")({
  head: () => ({
    meta: [
      { title: "Post — Spaces" },
      {
        name: "description",
        content: "Read the full post, replies and reactions from the Spaces community.",
      },
      { property: "og:title", content: "Post — Spaces" },
      { property: "og:description", content: "Read the full post and its replies on Spaces." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PostDetailPage,
});

function PostDetailPage() {
  const { postId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void Promise.all([getPost(postId), getPostComments(postId).catch(() => [])])
      .then(([p, c]) => {
        if (!active) return;
        setPost(p);
        setComments(c as PostComment[]);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [postId]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    if (!user) {
      toast.error("Sign in to reply");
      return;
    }
    setSending(true);
    try {
      const created = await addPostComment(postId, content);
      setDraft("");
      setComments((prev) => [...prev, created as PostComment]);
    } catch {
      toast.error("Could not post your reply");
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell title="Post" right={<DefaultRail />}>
      <button
        onClick={() => navigate({ to: "/feed" })}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to feed
      </button>

      {loading ? (
        <Panel className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
        </Panel>
      ) : !post ? (
        <Panel className="py-16 text-center">
          <h1 className="text-lg font-black">This post is no longer available</h1>
          <p className="mt-1 text-sm text-muted-foreground">It may have been deleted by its author.</p>
        </Panel>
      ) : (
        <div className="space-y-5">
          <PostCard post={post} onDeleted={() => navigate({ to: "/feed" })} />

          <Panel>
            <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-muted-foreground">
              Replies · {comments.length}
            </h2>

            <form onSubmit={submitComment} className="mb-5 flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={user ? "Write a reply..." : "Sign in to reply"}
                disabled={!user || sending}
                className="min-w-0 flex-1 rounded-2xl bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!user || sending || !draft.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-pink text-white disabled:opacity-50"
                aria-label="Send reply"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>

            {comments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No replies yet — be the first to say something.
              </p>
            ) : (
              <ul className="space-y-4">
                {comments.map((c) => {
                  const author = getProfile(c.user_id);
                  return (
                    <li key={c.id} className="flex gap-3">
                      <Avatar name={author.display_name} src={author.avatar_url} className="h-9 w-9 text-[0.65rem]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="font-bold">{author.display_name}</span>
                          <UserBadge verified={author.verified} size="xs" />
                          <span className="text-xs text-muted-foreground">@{author.username}</span>
                          <span className="text-xs text-muted-foreground">
                            · <TimeAgo iso={c.created_at} />
                          </span>
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-foreground/90">
                          {c.content}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
