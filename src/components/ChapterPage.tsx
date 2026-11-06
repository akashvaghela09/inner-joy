import type { Assignment } from "../../curriculum/tools/grade";
import { EXTERNAL_PLATFORM, externalPracticeFor, isRequired, typeLabel, type Group, type Stage } from "../curriculum";
import styles from "../landing.module.css";
import { groupProgress, stageProgress } from "../progress";
import { useProgress } from "../storage";
import ui from "../ui.module.css";
import { AttemptedIcon, ChevronLeftIcon, DoneIcon, ExternalLinkIcon, ExtraIcon, NotStartedIcon } from "./Icons";
import { ProgressBar } from "./ProgressBar";

function StatusIcon({ assignment }: { assignment: Assignment }) {
  const { completed, attempts } = useProgress();
  if (completed.has(assignment.id)) {
    return (
      <span style={{ color: "var(--success)", display: "inline-flex" }}>
        <DoneIcon />
        <span className={ui.srOnly}>Completed</span>
      </span>
    );
  }
  if ((attempts[assignment.id]?.failedQueries.length ?? 0) > 0) {
    return (
      <span style={{ color: "var(--attention)", display: "inline-flex" }}>
        <AttemptedIcon />
        <span className={ui.srOnly}>Attempted</span>
      </span>
    );
  }
  return (
    <span className={ui.muted} style={{ display: "inline-flex" }}>
      {isRequired(assignment) ? <NotStartedIcon /> : <ExtraIcon />}
    </span>
  );
}

function GroupSection({ group }: { group: Group }) {
  const { completed } = useProgress();
  const { done, total } = groupProgress(group, completed);
  return (
    <section>
      <div className={styles.groupHeading}>
        <div>
          <h2 className={styles.groupTitle}>{group.title}</h2>
          {group.outcome && <p className={styles.groupOutcome}>{group.outcome}</p>}
        </div>
        <span className={styles.count}>
          {done} of {total}
        </span>
      </div>
      <ul>
        {group.slots.map(({ position, assignment }) => (
          <li key={assignment.id}>
            <a className={styles.assignmentRow} href={`#/a/${assignment.id}`}>
              <StatusIcon assignment={assignment} />
              <span className={styles.assignmentNumber}>{position}</span>
              <span className={styles.assignmentTitle}>{assignment.title}</span>
              <span className={styles.assignmentType}>{typeLabel(assignment)}</span>
              <span className={styles.extraTag}>{isRequired(assignment) ? "" : "Extra"}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Always available: learners decide when they're ready to test themselves elsewhere. */
function VerifySkills({ stage }: { stage: Stage }) {
  const problems = externalPracticeFor(stage.id);
  if (problems.length === 0) return null;
  return (
    <section className={styles.verifySection}>
      <h2 className={styles.verifyHeading}>Verify your skills</h2>
      <p className={styles.verifyNote}>
        Try this chapter's skills on another platform whenever you feel ready. These may need an account, use other SQL
        dialects such as MySQL, and don't count towards your Inner Joy progress.
      </p>
      <ul>
        {problems.map((problem) => (
          <li key={problem.source}>
            <a className={styles.verifyRow} href={problem.url} target="_blank" rel="noopener noreferrer">
              <span>{problem.title}</span>
              <span className={styles.assignmentType}>{problem.difficulty}</span>
              <span className={styles.verifyPlatform}>
                {EXTERNAL_PLATFORM}
                <ExternalLinkIcon />
                <span className={ui.srOnly}>(opens in a new tab)</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ChapterPage({ stage }: { stage: Stage }) {
  const { completed } = useProgress();
  const progress = stageProgress(stage, completed);
  const written = stage.groups.filter((group) => group.slots.length > 0);
  const comingSoon = stage.groups.filter((group) => group.slots.length === 0 && group.kind === "skill");
  const assignments = written.flatMap((group) => group.slots.map((slot) => slot.assignment));
  const target =
    assignments.find((assignment) => isRequired(assignment) && !completed.has(assignment.id)) ??
    assignments.find((assignment) => !completed.has(assignment.id));

  return (
    <div className={styles.page}>
      <a className={styles.back} href="#/">
        <ChevronLeftIcon />
        All chapters
      </a>
      <section className={styles.intro}>
        <div>
          <p className={styles.chapterEyebrow}>Chapter {stage.id}</p>
          <h1 className={styles.title}>{stage.title}</h1>
        </div>
        {target && (
          <a className={`${ui.button} ${ui.primary} ${styles.continue}`} href={`#/a/${target.id}`}>
            {progress.done > 0 ? "Continue" : "Start"}: {target.title}
          </a>
        )}
      </section>

      <section className={styles.chapterProgress} aria-label="Chapter progress">
        <p className={styles.progressLabel}>
          <span className={styles.progressName}>Chapter progress</span>
          <span className={ui.muted}>
            {progress.done} of {progress.total} required
            {progress.available > 0 && ` · ${progress.available} available now`}
          </span>
        </p>
        <ProgressBar progress={progress} name={`Chapter ${stage.id} progress`} size="large" />
      </section>

      {written.length === 0 && <p className={styles.emptyNote}>The assignments for this chapter aren't written yet.</p>}

      {written.map((group) => (
        <GroupSection key={group.id} group={group} />
      ))}

      {comingSoon.length > 0 && (
        <section>
          <h2 className={styles.comingSoonHeading}>Coming soon</h2>
          <ul>
            {comingSoon.map((group) => (
              <li key={group.id} className={styles.comingSoonRow}>
                {group.title}
                <span className={styles.comingSoonOutcome}>{group.outcome}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <VerifySkills stage={stage} />
    </div>
  );
}
