import { useSyncExternalStore } from "react";

const COMPLETED_KEY = "inner-joy.completed.v1";
const ATTEMPTS_KEY = "inner-joy.attempts.v1";
const draftKey = (id: string) => `inner-joy.draft.v1.${id}`;
/** Only the unlock threshold matters, so older failed queries needn't be kept. */
const MAX_FAILED_QUERIES = 5;

export type Attempt = { failedQueries: string[]; hintsShown: number; answerViewed: boolean };
export const NO_ATTEMPT: Attempt = { failedQueries: [], hintsShown: 0, answerViewed: false };

type State = {
  completed: ReadonlySet<string>;
  attempts: Readonly<Record<string, Attempt>>;
};

function storageWorks(): boolean {
  try {
    const probe = "inner-joy.probe";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/** Browser storage can be blocked, so the app must work without it and say so. */
export const canSaveProgress = storageWorks();

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
    // Already reported through canSaveProgress.
  }
}

function parse(key: string): unknown {
  try {
    return JSON.parse(read(key) ?? "null");
  } catch {
    return null;
  }
}

function loadCompleted(): ReadonlySet<string> {
  const parsed = parse(COMPLETED_KEY);
  return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []);
}

function loadAttempts(): Record<string, Attempt> {
  const parsed = parse(ATTEMPTS_KEY);
  if (typeof parsed !== "object" || parsed === null) return {};
  const attempts: Record<string, Attempt> = {};
  for (const [id, value] of Object.entries(parsed)) {
    const { failedQueries, hintsShown, answerViewed } = (value ?? {}) as Partial<Attempt>;
    attempts[id] = {
      failedQueries: Array.isArray(failedQueries) ? failedQueries.filter((sql) => typeof sql === "string") : [],
      hintsShown: typeof hintsShown === "number" ? hintsShown : 0,
      answerViewed: answerViewed === true,
    };
  }
  return attempts;
}

let state: State = { completed: loadCompleted(), attempts: loadAttempts() };
const listeners = new Set<() => void>();

function publish(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function updateAttempt(id: string, change: (attempt: Attempt) => Attempt) {
  const attempts = { ...state.attempts, [id]: change(state.attempts[id] ?? NO_ATTEMPT) };
  write(ATTEMPTS_KEY, JSON.stringify(attempts));
  publish({ ...state, attempts });
}

export function markCompleted(id: string) {
  if (state.completed.has(id)) return;
  const completed = new Set(state.completed).add(id);
  write(COMPLETED_KEY, JSON.stringify([...completed]));
  publish({ ...state, completed });
}

/** Rerunning the same failed query doesn't count towards unlocking the answer. */
export function recordFailedCheck(id: string, sql: string) {
  const normalised = sql.trim().replace(/\s+/g, " ");
  updateAttempt(id, (attempt) =>
    attempt.failedQueries.includes(normalised)
      ? attempt
      : { ...attempt, failedQueries: [...attempt.failedQueries, normalised].slice(-MAX_FAILED_QUERIES) },
  );
}

export function recordHintShown(id: string) {
  updateAttempt(id, (attempt) => ({ ...attempt, hintsShown: attempt.hintsShown + 1 }));
}

export function recordAnswerViewed(id: string) {
  updateAttempt(id, (attempt) => ({ ...attempt, answerViewed: true }));
}

export function useProgress(): State {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
  );
}

export function loadDraft(id: string): string | null {
  return read(draftKey(id));
}

export function saveDraft(id: string, sql: string) {
  write(draftKey(id), sql);
}
