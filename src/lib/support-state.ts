import { useEffect, useState } from "react";

export interface SupportTicket {
  id: string;
  subject: string;
  category: "Creator Studio" | "Billing & Payouts" | "Spaces & Audio" | "API & Webhooks" | "Account Security";
  priority: "Urgent (15 min SLA)" | "High (1 hr SLA)" | "Normal (4 hr SLA)";
  status: "open" | "in_progress" | "resolved";
  lastMessage: string;
  updatedAt: string;
  createdAt: string;
}

const STORAGE_KEY = "spaces:support";

function read(): SupportTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SupportTicket[]) : [];
  } catch {
    return [];
  }
}

let tickets = read();
const listeners = new Set<() => void>();

export function useSupport() {
  const [list, setList] = useState<SupportTicket[]>(tickets);

  useEffect(() => {
    const sync = () => setList([...tickets]);
    listeners.add(sync);
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, []);

  function createTicket(
    subject: string,
    category: SupportTicket["category"],
    priority: SupportTicket["priority"],
    message: string,
  ) {
    const ticket: SupportTicket = {
      id: `TKT-${Date.now().toString().slice(-6)}`,
      subject,
      category,
      priority,
      status: "open",
      lastMessage: message,
      updatedAt: new Date().toLocaleString(),
      createdAt: new Date().toLocaleString(),
    };
    tickets = [ticket, ...tickets];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      /* storage unavailable */
    }
    listeners.forEach((fn) => fn());
    return ticket;
  }

  return {
    tickets: list,
    conciergeAssigned: {
      name: "Dedicated VIP Concierge",
      title: "Spaces Priority Executive Support",
      avatar: null as string | null,
    },
    createTicket,
  };
}
