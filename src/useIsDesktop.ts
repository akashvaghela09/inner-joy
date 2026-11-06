import { useSyncExternalStore } from "react";

const query = window.matchMedia("(min-width: 1024px) and (min-height: 640px)");

/** Whether there's room for the split workbench. Matches the CSS breakpoint. */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    (listener) => {
      query.addEventListener("change", listener);
      return () => query.removeEventListener("change", listener);
    },
    () => query.matches,
  );
}
