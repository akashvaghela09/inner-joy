import { stages, type Stage } from "../curriculum";
import styles from "../landing.module.css";
import {
  extraDone,
  firstIncompleteExtra,
  firstIncompleteRequired,
  overallProgress,
  stageProgress,
} from "../progress";
import { useProgress } from "../storage";
import ui from "../ui.module.css";
import { ChevronRightIcon } from "./Icons";
import { ProgressBar } from "./ProgressBar";

function ContinueAction() {
  const { completed } = useProgress();
  const required = firstIncompleteRequired(completed);
  if (required) {
    return (
      <a className={`${ui.button} ${ui.primary} ${styles.continue}`} href={`#/a/${required.id}`}>
        {completed.size > 0 ? "Continue" : "Start"}: {required.title}
      </a>
    );
  }
  const extra = firstIncompleteExtra(completed);
  return (
    <p>
      You've finished everything written so far.
      {extra && (
        <>
          {" "}
          <a href={`#/a/${extra.id}`}>Try extra practice: {extra.title}</a>
        </>
      )}
    </p>
  );
}

function ChapterRow({ stage }: { stage: Stage }) {
  const { completed } = useProgress();
  const progress = stageProgress(stage, completed);
  return (
    <li>
      <a className={styles.chapterRow} href={`#/chapter/${stage.id}`}>
        <span className={styles.chapterNumber}>Chapter {stage.id}</span>
        <span className={styles.chapterName}>{stage.title}</span>
        <span className={styles.chapterBar}>
          <ProgressBar progress={progress} name={`Chapter ${stage.id} progress`} size="small" />
        </span>
        <span className={styles.count}>
          {progress.available === 0 ? "Coming soon" : `${progress.done} of ${progress.total}`}
        </span>
        <span className={styles.rowArrow}>
          <ChevronRightIcon />
        </span>
      </a>
    </li>
  );
}

export function LandingPage() {
  const { completed } = useProgress();
  const overall = overallProgress(completed);
  const extras = extraDone(completed);

  return (
    <div className={styles.page}>
      <section className={styles.intro}>
        <div>
          <h1 className={styles.title}>Learn SQL by writing it</h1>
          <p className={styles.subtitle}>Short, hands-on assignments that run in your browser.</p>
        </div>
        <ContinueAction />
      </section>

      <section className={styles.overall} aria-label="Overall progress">
        <p className={styles.progressLabel}>
          <span className={styles.progressName}>Inner Joy progress</span>
          <span className={ui.muted}>
            {overall.done} of {overall.total} required · {overall.available} available now
            {extras > 0 && ` · ${extras} extra done`}
          </span>
        </p>
        <ProgressBar progress={overall} name="Overall Inner Joy progress" size="large" />
      </section>

      <ul aria-label="Chapters">
        {stages.map((stage) => (
          <ChapterRow key={stage.id} stage={stage} />
        ))}
      </ul>
    </div>
  );
}
