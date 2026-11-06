import { useEffect, useState } from "react";
import { datasetById, skillTitle, stageOfSkill, firstAssignmentOfSkill, type Lesson } from "../curriculum";
import styles from "../landing.module.css";
import type { WorkerOutcome } from "../protocol";
import { paths } from "../routes";
import ui from "../ui.module.css";
import { sendToWorker } from "../workerClient";
import { ChevronLeftIcon } from "./Icons";
import { RunResults } from "./RunResults";

export function LessonPage({ lesson }: { lesson: Lesson }) {
  const stage = stageOfSkill(lesson.skill);
  const first = firstAssignmentOfSkill(lesson.skill);
  const dataset = datasetById(lesson.example.dataset);
  const [outcome, setOutcome] = useState<WorkerOutcome | null>(null);

  useEffect(() => {
    let active = true;
    sendToWorker({ op: "example", sql: lesson.example.sql, dataset }).then((result) => {
      if (active) setOutcome(result);
    });
    return () => {
      active = false;
    };
  }, [lesson, dataset]);

  return (
    <div className={styles.page}>
      <a className={styles.back} href={paths.chapter(stage.id)}>
        <ChevronLeftIcon />
        Chapter {stage.id}: {stage.title}
      </a>
      <p className={styles.chapterEyebrow}>Lesson</p>
      <h1 className={styles.title}>{skillTitle(lesson.skill)}</h1>
      <p className={styles.lessonSummary}>{lesson.summary}</p>

      <ul className={styles.lessonPoints}>
        {lesson.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <h2 className={styles.lessonHeading}>Worked example</h2>
      <p className={styles.lessonExplain}>{lesson.example.explanation}</p>
      <pre className={styles.lessonCode}>{lesson.example.sql}</pre>
      <div className={styles.lessonResult}>
        {outcome?.kind === "run" && <RunResults outcome={outcome} />}
        {outcome?.kind === "error" && (
          <pre role="alert" className={ui.errorBox}>
            {outcome.error}
          </pre>
        )}
      </div>
      <p className={ui.muted}>This uses the {dataset.title} data.</p>

      {first && (
        <p className={styles.lessonAction}>
          <a className={`${ui.button} ${ui.primary}`} href={paths.assignment(first.id)}>
            Start practising: {first.title}
          </a>
        </p>
      )}
    </div>
  );
}
