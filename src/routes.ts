import { useSyncExternalStore } from "react";

/** Ends with "/". Set at build time, so the app can live in a subfolder. */
const BASE = import.meta.env.BASE_URL;

export const paths = {
  home: BASE,
  chapter: (id: number) => `${BASE}chapter/${id}`,
  assignment: (id: string) => `${BASE}assignments/${id}`,
  lesson: (skill: number) => `${BASE}lessons/${skill}`,
  playground: `${BASE}playground`,
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** The current path without the base or a trailing slash, such as "chapter/2". */
function currentPath(): string {
  const path = window.location.pathname;
  const relative = path.startsWith(BASE) ? path.slice(BASE.length) : path.replace(/^\//, "");
  return relative.replace(/\/+$/, "");
}

export function usePath(): string {
  return useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, currentPath);
}

/** Keeps links shared before the move to real paths working. */
function redirectLegacyHash() {
  const hash = window.location.hash;
  if (!hash.startsWith("#/")) return;
  const legacy = hash.slice(2);
  const path = legacy.replace(/^a\//, "assignments/").replace(/^stage\//, "chapter/");
  window.history.replaceState(null, "", `${BASE}${path}`);
}

function isInternalNavigation(event: MouseEvent, anchor: HTMLAnchorElement): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  return anchor.origin === window.location.origin && anchor.pathname.startsWith(BASE);
}

/** Plain links stay plain: this turns same-site clicks into history navigation. */
export function startRouter(): () => void {
  redirectLegacyHash();

  const onClick = (event: MouseEvent) => {
    const anchor = (event.target as Element | null)?.closest?.("a");
    if (!anchor || !isInternalNavigation(event, anchor)) return;
    event.preventDefault();
    if (anchor.href !== window.location.href) window.history.pushState(null, "", anchor.href);
    notify();
  };

  document.addEventListener("click", onClick);
  window.addEventListener("popstate", notify);
  return () => {
    document.removeEventListener("click", onClick);
    window.removeEventListener("popstate", notify);
  };
}
