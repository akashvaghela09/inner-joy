import { useEffect, useRef, useState } from "react";
import { AssignmentView } from "./components/AssignmentView";
import { ChapterPage } from "./components/ChapterPage";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { PlaygroundView } from "./components/PlaygroundView";
import { findAssignment, stages, type Stage } from "./curriculum";
import ui from "./ui.module.css";
import wb from "./workbench.module.css";

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return hash;
}

type Route =
  | { name: "landing" }
  | { name: "chapter"; stage: Stage }
  | { name: "assignment"; id: string }
  | { name: "playground" }
  | { name: "notFound" };

function parseRoute(hash: string): Route {
  if (hash === "" || hash === "#" || hash === "#/") return { name: "landing" };
  if (hash === "#/playground") return { name: "playground" };
  const assignmentId = hash.match(/^#\/a\/(.+)$/)?.[1];
  if (assignmentId && findAssignment(assignmentId)) return { name: "assignment", id: assignmentId };
  const chapterId = Number(hash.match(/^#\/chapter\/(\d+)$/)?.[1]);
  const stage = stages.find((candidate) => candidate.id === chapterId);
  if (stage) return { name: "chapter", stage };
  return { name: "notFound" };
}

function pageTitle(route: Route): string {
  switch (route.name) {
    case "assignment":
      return `${findAssignment(route.id)!.title} · Inner Joy`;
    case "chapter":
      return `${route.stage.title} · Inner Joy`;
    case "playground":
      return "Playground · Inner Joy";
    case "notFound":
      return "Page not found · Inner Joy";
    case "landing":
      return "Inner Joy";
  }
}

export function App() {
  const hash = useHash();
  const route = parseRoute(hash);
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);
  const fixedHeight = route.name === "assignment" || route.name === "playground";

  useEffect(() => {
    document.title = pageTitle(route);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [hash]);

  return (
    <div className={`${ui.page} ${fixedHeight ? wb.desktopFrame : ""}`}>
      <a
        className={ui.skipLink}
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      <Header section={route.name === "playground" ? "playground" : "chapters"} />
      <main id="main" ref={mainRef} className={ui.main} tabIndex={-1}>
        {route.name === "landing" && <LandingPage />}
        {route.name === "chapter" && <ChapterPage stage={route.stage} />}
        {route.name === "assignment" && <AssignmentView key={route.id} assignment={findAssignment(route.id)!} />}
        {route.name === "playground" && <PlaygroundView />}
        {route.name === "notFound" && (
          <div className={ui.notFound}>
            <h1>Page not found</h1>
            <p>
              That page doesn't exist. <a href="#/">Go to all chapters</a>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
