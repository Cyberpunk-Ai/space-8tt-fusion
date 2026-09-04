import { useEffect, useState } from "react";

import { currentUser } from "@/lib/profile-service";

export type WorkspaceRole = "Owner" | "Admin" | "Editor" | "Analyst" | "Contributor";

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  role: WorkspaceRole;
  status: "active" | "invited";
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoEmoji: string;
  createdAt: string;
  seatsTotal: number;
  members: WorkspaceMember[];
}

const STORAGE_KEY = "spaces:workspaces";

function defaultWorkspaces(): Workspace[] {
  return [
    {
      id: "ws_default",
      name: "My Creator Studio",
      slug: "creator-studio",
      logoEmoji: "🚀",
      createdAt: new Date().toLocaleDateString(),
      seatsTotal: 5,
      members: [
        {
          id: "member_owner",
          name: currentUser.display_name || "You",
          email: currentUser.email || "you@spaces.app",
          avatar_url: currentUser.avatar_url ?? null,
          role: "Owner",
          status: "active",
        },
      ],
    },
  ];
}

function read(): Workspace[] {
  if (typeof window === "undefined") return defaultWorkspaces();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Workspace[]) : null;
    return parsed && parsed.length > 0 ? parsed : defaultWorkspaces();
  } catch {
    return defaultWorkspaces();
  }
}

let workspaces = read();
let activeWsId = workspaces[0]?.id ?? "ws_default";
const listeners = new Set<() => void>();

function commit(next: Workspace[]) {
  workspaces = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((fn) => fn());
}

function mutateActive(fn: (ws: Workspace) => Workspace) {
  commit(workspaces.map((ws) => (ws.id === activeWsId ? fn(ws) : ws)));
}

export function useWorkspace() {
  const [, force] = useState(0);

  useEffect(() => {
    const rerender = () => force((n) => n + 1);
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, []);

  const activeWorkspace = workspaces.find((w) => w.id === activeWsId) ?? workspaces[0]!;

  return {
    workspaces,
    activeWorkspace,
    activeWsId,
    setActiveWsId: (id: string) => {
      activeWsId = id;
      listeners.forEach((fn) => fn());
    },
    inviteMember(email: string, role: WorkspaceRole) {
      mutateActive((ws) => ({
        ...ws,
        members: [
          ...ws.members,
          {
            id: `member_${Date.now()}`,
            name: email.split("@")[0] || "Teammate",
            email,
            avatar_url: null,
            role,
            status: "invited",
          },
        ],
      }));
    },
    removeMember(id: string) {
      mutateActive((ws) => ({ ...ws, members: ws.members.filter((m) => m.id !== id) }));
    },
    updateMemberRole(id: string, role: WorkspaceRole) {
      mutateActive((ws) => ({
        ...ws,
        members: ws.members.map((m) => (m.id === id ? { ...m, role } : m)),
      }));
    },
    createWorkspace(name: string, logoEmoji = "✨") {
      const ws: Workspace = {
        id: `ws_${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        logoEmoji,
        createdAt: new Date().toLocaleDateString(),
        seatsTotal: 5,
        members: [],
      };
      commit([...workspaces, ws]);
      activeWsId = ws.id;
    },
  };
}
