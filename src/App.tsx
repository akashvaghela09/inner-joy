import { useEffect, useRef } from "react";
import { AssignmentView } from "./components/AssignmentView";
import { ChapterPage } from "./components/ChapterPage";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { LessonPage } from "./components/LessonPage";
import { PlaygroundView } from "./components/PlaygroundView";
import { findAssignment, findLesson, skillTitle, stages, type Lesson, type Stage } from "./curriculum";
import { paths, startRouter, usePath } from "./routes";
import ui from "./ui.module.css";
import wb from "./workbench.module.css";

// Runs before the first render, so a legacy "#/" link resolves immediately.
startRouter();

type Route =
  | { name: "landing" }
  | { name: "chapter"; stage: Stage }
  | { name: "lesson"; lesson: Lesson }
  | { name: "assignment"; id: string }
  | { name: "playground" }
  | { name: "notFound" };

function parseRoute(path: string): Route {
  if (path === "") return { name: "landing" };
  if (path === "playground") return { name: "playground" };
  const assignmentId = path.match(/^assignments\/([^/]+)$/)?.[1];
  if (assignmentId && findAssignment(assignmentId)) return { name: "assignment", id: assignmentId };
  const chapterId = Number(path.match(/^chapter\/(\d+)$/)?.[1]);
  const stage = stages.find((candidate) => candidate.id === chapterId);
  if (stage) return { name: "chapter", stage };
  const lesson = findLesson(Number(path.match(/^lessons\/(\d+)$/)?.[1]));
  if (lesson) return { name: "lesson", lesson };
  return { name: "notFound" };
}

function pageTitle(route: Route): string {
  switch (route.name) {
    case "assignment":
      return `${findAssignment(route.id)!.title} · Inner Joy`;
    case "chapter":
      return `${route.stage.title} · Inner Joy`;
    case "lesson":
      return `${skillTitle(route.lesson.skill)} lesson · Inner Joy`;
    case "playground":
      return "Playground · Inner Joy";
    case "notFound":
      return "Page not found · Inner Joy";
    case "landing":
      return "Inner Joy";
  }
}

export function App() {
  const path = usePath();
  const route = parseRoute(path);
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
  }, [path]);

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
        {route.name === "lesson" && <LessonPage key={route.lesson.skill} lesson={route.lesson} />}
        {route.name === "assignment" && <AssignmentView key={route.id} assignment={findAssignment(route.id)!} />}
        {route.name === "playground" && <PlaygroundView />}
        {route.name === "notFound" && (
          <div className={ui.notFound}>
            <h1>Page not found</h1>
            <p>
              That page doesn't exist. <a href={paths.home}>Go to all chapters</a>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
