import { createFileRoute } from "@tanstack/react-router";
import { Calendar, LinkIcon, MapPin, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/social/AppShell";
import { Avatar } from "@/components/social/Avatar";
import { EditProfileModal } from "@/components/social/EditProfileModal";
import { PostCard } from "@/components/social/PostCard";
import { FeedSkeleton } from "@/components/social/PostSkeleton";
import { DefaultRail } from "@/components/social/RightRail";
import { UserBadge } from "@/components/social/UserBadge";
import { getPosts } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-state";
import { useBranding } from "@/lib/branding-state";
import { currentUser, useProfile } from "@/lib/profile-service";
import type { Post, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  validateSearch: (search: Record<string, unknown>): { id?: string; user?: string } => ({
    ...(typeof search["id"] === "string" ? { id: search["id"] as string } : {}),
    ...(typeof search["user"] === "string" ? { user: search["user"] as string } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Creator Profile — Spaces" },
      { name: "description", content: "View a Spaces creator profile: bio, posts, followers and creator badges." },
      { property: "og:title", content: "Creator Profile — Spaces" },
      { property: "og:description", content: "View a Spaces creator profile, posts and badges." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { id } = Route.useSearch();
  const { user } = useAuth();
  const { activeTheme } = useBranding();
  const viewed = useProfile(id || "");
  const profile: Profile = (id ? viewed : user) || currentUser;
  const isMe = !id || profile.id === (user?.id ?? currentUser.id);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!profile.id) return;
    setLoading(true);
    getPosts({ userId: profile.id })
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [profile.id]);

  return (
    <AppShell title="Profile" right={<DefaultRail />}>
      <div className={cn("overflow-hidden rounded-3xl border-2 bg-card shadow-soft", activeTheme.borderClass)}>
        <div className={cn("h-28 bg-gradient-to-r", activeTheme.gradient)} />
        <div className="p-6">
          <div className="-mt-14 flex items-end justify-between gap-3">
            <Avatar name={profile.display_name} src={profile.avatar_url} className="h-20 w-20 text-2xl ring-4 ring-card" />
            {isMe && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold hover:bg-foreground/5"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit profile
              </button>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{profile.display_name}</h1>
              <UserBadge plan={profile.plan ?? null} verified={!!profile.verified} isMe={isMe} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="text-sm">{profile.bio}</p>}

            <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {profile.location}
                </span>
              )}
              {profile.website && (
                <span className="flex items-center gap-1">
                  <LinkIcon className="h-3.5 w-3.5" /> {profile.website}
                </span>
              )}
              {profile.joined_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Joined {new Date(profile.joined_at).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex gap-5 pt-2 text-sm">
              <span><strong>{profile.following ?? 0}</strong> <span className="text-muted-foreground">Following</span></span>
              <span><strong>{profile.followers ?? 0}</strong> <span className="text-muted-foreground">Followers</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <p className="rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
            No posts yet.
          </p>
        ) : (
          posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} onDeleted={(pid) => setPosts((prev) => prev.filter((p) => p.id !== pid))} />
          ))
        )}
      </div>

      <EditProfileModal isOpen={editing} onClose={() => setEditing(false)} initialProfile={profile} />
    </AppShell>
  );
}
