import { useEffect, useState } from "react";

import { PLAN_DETAILS, type BillingCycle, type PlanTier } from "@/lib/plans";
import { currentUser, setCurrentUser, subscribeProfiles } from "@/lib/profile-service";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "spaces:plan-state";

interface PlanUsage {
  aiDraftsToday: number;
  day: string;
}

interface StoredPlanState {
  cycle: BillingCycle;
  usage: PlanUsage;
  paymentMethod?: { brand: string; last4: string; exp: string };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function read(): StoredPlanState {
  const fallback: StoredPlanState = {
    cycle: "monthly",
    usage: { aiDraftsToday: 0, day: today() },
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = { ...fallback, ...(JSON.parse(raw) as StoredPlanState) };
    if (parsed.usage?.day !== today()) parsed.usage = { aiDraftsToday: 0, day: today() };
    return parsed;
  } catch {
    return fallback;
  }
}

let state = read();
const listeners = new Set<() => void>();

function commit(next: Partial<StoredPlanState>) {
  state = { ...state, ...next };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }
  listeners.forEach((fn) => fn());
}

/** Opens the global upgrade modal, optionally naming the locked feature. */
export function openUpgradeModal(featureHint?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("spaces:open-upgrade-modal", { detail: { featureHint } }),
  );
}

export function usePlan() {
  const [, force] = useState(0);

  useEffect(() => {
    const rerender = () => force((n) => n + 1);
    listeners.add(rerender);
    const unsubscribe = subscribeProfiles(rerender);
    return () => {
      listeners.delete(rerender);
      unsubscribe();
    };
  }, []);

  const currentPlan: PlanTier = (currentUser.plan as PlanTier) || "free";
  const planDetails = PLAN_DETAILS[currentPlan] ?? PLAN_DETAILS.free;

  async function upgradePlan(
    plan: PlanTier,
    cycle: BillingCycle = "monthly",
    paymentMethod?: { brand: string; last4: string; exp: string },
  ) {
    commit(paymentMethod ? { cycle, paymentMethod } : { cycle });
    setCurrentUser({ ...currentUser, plan });
    if (currentUser.id && currentUser.id !== "guest") {
      await supabase.from("profiles").update({ plan }).eq("id", currentUser.id);
    }
  }

  function recordAiDraftUsage() {
    const usage = state.usage.day === today() ? state.usage : { aiDraftsToday: 0, day: today() };
    commit({ usage: { day: usage.day, aiDraftsToday: usage.aiDraftsToday + 1 } });
  }

  return {
    currentPlan,
    planDetails,
    cycle: state.cycle,
    usage: state.usage,
    paymentMethod: state.paymentMethod ?? null,
    isPlus: currentPlan === "plus" || currentPlan === "pro",
    isPro: currentPlan === "pro",
    upgradePlan,
    recordAiDraftUsage,
    openUpgradeModal,
  };
}
