import { useSyncExternalStore } from "react";

const COMPLETED_KEY = "inner-joy.completed.v1";
const draftKey = (id: string) => `inner-joy.draft.v1.${id}`;

// Browser storage can be blocked or cleared, so the app must work without it.
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Progress simply won't survive a reload.
  }
}

function loadCompleted(): ReadonlySet<string> {
  try {
    const parsed: unknown = JSON.parse(read(COMPLETED_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

let completed = loadCompleted();
const listeners = new Set<() => void>();

export function markCompleted(id: string) {
  if (completed.has(id)) return;
  completed = new Set(completed).add(id);
  write(COMPLETED_KEY, JSON.stringify([...completed]));
  listeners.forEach((listener) => listener());
}

export function useCompleted(): ReadonlySet<string> {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => completed,
  );
}

export function loadDraft(id: string): string | null {
  return read(draftKey(id));
}

export function saveDraft(id: string, sql: string) {
  write(draftKey(id), sql);
}
