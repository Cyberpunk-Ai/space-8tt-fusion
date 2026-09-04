import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare, Send } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageHeader, Panel } from "@/components/social/AppShell";
import { Avatar } from "@/components/social/Avatar";
import { getConversations, getMessages, sendMessage } from "@/lib/api-client";
import { useProfile } from "@/lib/profile-service";
import { useRealtime } from "@/lib/realtime";
import type { Conversation, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Spaces" },
      { name: "description", content: "Private, real-time direct messages with creators and collaborators on Spaces." },
      { property: "og:title", content: "Messages — Spaces" },
      { property: "og:description", content: "Private real-time direct messages on Spaces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MessagesPage,
});

function ConversationButton({
  conversation,
  active,
  onSelect,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
}) {
  const profile = useProfile(conversation.participant_id);
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
        active ? "bg-brand/10" : "hover:bg-foreground/5",
      )}
    >
      <Avatar name={profile?.display_name || "User"} src={profile?.avatar_url ?? null} className="h-9 w-9 text-xs" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{profile?.display_name || "Conversation"}</p>
        <p className="truncate text-xs text-muted-foreground">{conversation.preview}</p>
      </div>
      {conversation.unread > 0 && (
        <span className="rounded-full bg-brand px-2 py-0.5 text-[0.65rem] font-bold text-white">
          {conversation.unread}
        </span>
      )}
    </button>
  );
}

function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    getConversations()
      .then((list) => {
        setConversations(list);
        if (list[0]) setActiveId(list[0].id);
      })
      .catch(() => setConversations([]));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    getMessages(activeId)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [activeId]);

  useRealtime({
    "message:created": (message: Message) => {
      if (message && message.conversation_id === activeId) setMessages((prev) => [...prev, message]);
    },
  });

  const active = conversations.find((c) => c.id === activeId) || null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    const body = draft.trim();
    setDraft("");
    try {
      const res = await sendMessage(active.participant_id, body);
      if (res.message) setMessages((prev) => [...prev, res.message]);
    } catch {
      /* optimistic only */
    }
  }

  return (
    <AppShell title="Messages">
      <PageHeader title="Messages" subtitle="Your private conversations" />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Panel className="space-y-1">
          {conversations.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <ConversationButton
                key={c.id}
                conversation={c}
                active={c.id === activeId}
                onSelect={() => setActiveId(c.id)}
              />
            ))
          )}
        </Panel>

        <Panel className="flex min-h-[420px] flex-col">
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessagesSquare className="h-6 w-6" />
              <p className="text-sm">Select a conversation to start chatting.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-2 overflow-y-auto pb-3">
                {messages.map((m) => (
                  <div key={m.id} className="max-w-[80%] rounded-2xl bg-muted/50 px-3.5 py-2 text-sm">
                    {m.body}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border/60 pt-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 rounded-2xl bg-muted/40 px-4 py-2.5 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-brand to-brand-pink p-2.5 text-white"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
