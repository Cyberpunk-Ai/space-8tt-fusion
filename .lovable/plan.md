# Make Spaces fully functional on a real backend

The UI is complete, but several core actions silently fail because the app talks to tables that don't exist, and a few areas (plans, tips, teams, support, developer keys) only live in the browser's local storage, so nothing survives a refresh or a second device.

## What's broken today

- Likes, comments, reposts and bookmarks call tables named `post_likes` / `post_comments` / `post_reposts` / `post_bookmarks`. The database actually has `likes`, `comments`, `reposts`, `bookmarks`. Every engagement action fails.
- Signing up doesn't reliably create a profile — it's done from the browser and can be skipped.
- Counters (like/comment/repost/view counts) are stored on posts but never updated.
- No notifications are generated when someone likes, comments, reposts or follows you.
- Uploads point at a `media` storage bucket that doesn't exist.
- Admin console isn't restricted to admins.
- Plans/billing, tips & payouts, team workspaces, support tickets and developer API keys are browser-only mock state.

## Plan

### 1. Database (one migration)
- Views/aliases fix: rename app access to the real tables (`likes`, `comments`, `reposts`, `bookmarks`) — done in code, not SQL.
- New tables, each with grants + row-level security scoped to the owner:
  - `subscriptions` (plan tier, billing cycle, renewal date, AI usage counter)
  - `payouts` and payout destinations on a `monetization_settings` table
  - `workspaces` + `workspace_members` (owner/admin/member roles, invitations)
  - `support_tickets` + `support_ticket_messages`
  - `api_keys` and `webhooks` (hashed key, prefix shown in UI)
  - `branding_settings` (theme, tagline, post aura) per user
- Automatic profile creation on signup (database trigger on new auth users).
- Triggers that keep post counters accurate on like/comment/repost/impression.
- Triggers that create notifications on like, comment, repost, follow, tip.
- Admin checks routed through the existing role table so only real admins pass.
- Storage bucket `media` (public read, owner write) for avatars, post and story images.

### 2. Data layer
- Point `api-client` at the correct tables and add typed functions for the new ones.
- Replace the local-storage stores (`plan-state`, `monetization-state`, `workspace-state`, `support-state`, `developer-state`, `branding-state`) with backend-backed hooks that load once, cache, and write through — keeping the same hook API so no UI rewrite is needed.
- Keep an optimistic-update path so the UI stays instant.

### 3. Auth & access
- Move `/messages`, `/settings`, `/bookmarks`, `/notifications`, `/profile` and `/admin` under the protected layout; keep `/`, `/explore`, `/spaces`, `/pricing` public.
- Add Google sign-in alongside email/password on `/auth`.
- Admin route additionally checks the admin role and shows a clean "not authorised" state.

### 4. Realtime
- Subscribe to database changes (posts, messages, notifications, space participants) instead of only in-browser events, so feeds and chats update live across devices.

### 5. Polish pass
- Loading skeletons and empty states on every list.
- Toasts for every write, with error recovery.
- Per-page titles/descriptions for sharing and search.
- Full mobile pass and a browser smoke test of every route signed in and signed out.

## Notes
Payments stay simulated (upgrades write a real subscription row but no card is charged) unless you want Stripe wired in — say the word and that becomes a follow-up step.
