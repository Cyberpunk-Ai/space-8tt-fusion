import { useEffect, useState } from "react";

export interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  fullKey?: string;
  createdAt: string;
  lastUsed: string;
}

export interface Webhook {
  id: string;
  url: string;
  description: string;
  events: string[];
  status: "active" | "paused";
  createdAt: string;
}

interface DeveloperState {
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  totalApiCallsThisMonth: number;
}

const STORAGE_KEY = "spaces:developer";
const DEFAULTS: DeveloperState = { apiKeys: [], webhooks: [], totalApiCallsThisMonth: 0 };

function read(): DeveloperState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as DeveloperState) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

let state = read();
const listeners = new Set<() => void>();

function commit(next: DeveloperState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((fn) => fn());
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function useDeveloper() {
  const [snapshot, setSnapshot] = useState<DeveloperState>(state);

  useEffect(() => {
    const sync = () => setSnapshot({ ...state });
    listeners.add(sync);
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, []);

  async function generateApiKey(name: string): Promise<ApiKey> {
    const token = `sk_live_${randomToken()}`;
    const key: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      maskedKey: `sk_live_••••••••${token.slice(-6)}`,
      fullKey: token,
      createdAt: new Date().toLocaleDateString(),
      lastUsed: "Never",
    };
    commit({ ...state, apiKeys: [key, ...state.apiKeys] });
    return key;
  }

  function revokeApiKey(id: string) {
    commit({ ...state, apiKeys: state.apiKeys.filter((k) => k.id !== id) });
  }

  function addWebhook(url: string, description: string, events: string[]) {
    const hook: Webhook = {
      id: `wh_${Date.now()}`,
      url,
      description,
      events,
      status: "active",
      createdAt: new Date().toLocaleDateString(),
    };
    commit({ ...state, webhooks: [hook, ...state.webhooks] });
  }

  function removeWebhook(id: string) {
    commit({ ...state, webhooks: state.webhooks.filter((w) => w.id !== id) });
  }

  return {
    apiKeys: snapshot.apiKeys,
    webhooks: snapshot.webhooks,
    totalApiCallsThisMonth: snapshot.totalApiCallsThisMonth,
    generateApiKey,
    revokeApiKey,
    addWebhook,
    removeWebhook,
  };
}
