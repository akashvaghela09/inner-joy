import { useEffect, useState } from "react";
import styles from "./app.module.css";
import { AssignmentView } from "./components/AssignmentView";
import { PlaygroundView } from "./components/PlaygroundView";
import { Sidebar } from "./components/Sidebar";
import { findAssignment, orderedAssignments } from "./curriculum";
import { useCompleted } from "./storage";

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return hash;
}

export function App() {
  const hash = useHash();
  const completed = useCompleted();
  const playgroundActive = hash === "#/playground";
  const routedId = hash.match(/^#\/a\/(.+)$/)?.[1];

  const routed = findAssignment(routedId);

  // With no valid route, resume at the first assignment not yet completed.
  const assignment =
    routed ?? orderedAssignments.find((candidate) => !completed.has(candidate.id)) ?? orderedAssignments[0];

  // Pin the resume point to the URL, so completing it doesn't swap the screen.
  useEffect(() => {
    if (!routed && !playgroundActive) window.location.replace(`#/a/${assignment.id}`);
  }, [routed, playgroundActive, assignment.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hash]);

  return (
    <div className={styles.shell}>
      <Sidebar activeId={playgroundActive ? undefined : assignment.id} playgroundActive={playgroundActive} />
      <main className={styles.main}>
        {playgroundActive ? <PlaygroundView /> : <AssignmentView key={assignment.id} assignment={assignment} />}
      </main>
    </div>
  );
}
