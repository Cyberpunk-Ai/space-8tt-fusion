import { createFileRoute } from "@tanstack/react-router";

import { FeedPage } from "./feed";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spaces — Social Feed, Stories & Live Audio Rooms" },
      { name: "description", content: "Spaces is a creator-first social network with a smart feed, 24h stories, live audio rooms, tipping and analytics." },
      { property: "og:title", content: "Spaces — Social Feed, Stories & Live Audio Rooms" },
      { property: "og:description", content: "Join Spaces: smart feed, stories, live audio rooms, creator tipping and analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedPage,
});
