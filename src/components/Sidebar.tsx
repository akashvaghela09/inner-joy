import { useState } from "react";
import styles from "../app.module.css";
import { navigation, orderedAssignments } from "../curriculum";
import { useCompleted } from "../storage";

export function Sidebar({ activeId, playgroundActive }: { activeId?: string; playgroundActive: boolean }) {
  const completed = useCompleted();
  const [open, setOpen] = useState(false);
  const total = orderedAssignments.length;
  const doneCount = orderedAssignments.filter((assignment) => completed.has(assignment.id)).length;
  const closeOnPhone = () => setOpen(false);
  const linkClass = (active: boolean) => `${styles.navLink} ${active ? styles.navLinkActive : ""}`;

  return (
    <aside className={styles.sidebar}>
      <a className={styles.brand} href="#/">
        Inner Joy
      </a>
      <p className={styles.progressText}>
        {doneCount} of {total} completed
      </p>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${(doneCount / total) * 100}%` }} />
      </div>
      <button className={`${styles.button} ${styles.navToggle}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "Hide assignments" : "Show assignments"}
      </button>
      <nav aria-label="Curriculum" className={open ? undefined : styles.navCollapsed}>
        {navigation.map((stage) => (
          <section key={stage.id}>
            <h2 className={styles.stageTitle}>
              Stage {stage.id}: {stage.title}
            </h2>
            {stage.groups.map((group) => (
              <div key={group.id}>
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <ul className={styles.navList}>
                  {group.assignments.map((assignment) => (
                    <li key={assignment.id}>
                      <a
                        className={linkClass(assignment.id === activeId)}
                        href={`#/a/${assignment.id}`}
                        aria-current={assignment.id === activeId ? "page" : undefined}
                        onClick={closeOnPhone}
                      >
                        <span className={styles.navMark}>
                          {completed.has(assignment.id) ? (
                            <span role="img" aria-label="Completed">
                              ✓
                            </span>
                          ) : null}
                        </span>
                        {assignment.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
        <div className={styles.playgroundLink}>
          <a className={linkClass(playgroundActive)} href="#/playground" onClick={closeOnPhone}>
            <span className={styles.navMark} />
            Playground
          </a>
        </div>
      </nav>
    </aside>
  );
}
