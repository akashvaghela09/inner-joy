import { useEffect, useRef } from "react";
import type { Assignment } from "../../curriculum/tools/grade";
import { isRequired, stages, typeLabel, type Group, type Stage } from "../curriculum";
import styles from "../landing.module.css";
import {
  extraDone,
  firstIncompleteExtra,
  firstIncompleteRequired,
  groupProgress,
  overallProgress,
  stageProgress,
} from "../progress";
import { useProgress } from "../storage";
import ui from "../ui.module.css";
import { AttemptedIcon, ChevronRightIcon, DoneIcon, ExtraIcon, NotStartedIcon } from "./Icons";
import { ProgressBar } from "./ProgressBar";

function ContinueAction() {
  const { completed } = useProgress();
  const required = firstIncompleteRequired(completed);
  const started = completed.size > 0;
  if (required) {
    return (
      <a className={`${ui.button} ${ui.primary} ${styles.continue}`} href={`#/a/${required.id}`}>
        {started ? "Continue" : "Start"}: {required.title}
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

function GroupCells({ group }: { group: Group }) {
  const { completed, attempts } = useProgress();
  // Long review and checkpoint lists are summarised by their count alone.
  if (group.kind !== "skill") return <span />;
  return (
    <span className={styles.cells} aria-hidden="true">
      {Array.from({ length: group.planned }, (_, index) => {
        const position = index + 1;
        const assignment = group.slots.find((slot) => slot.position === position)?.assignment;
        const stateClass = !assignment
          ? styles.cellUnwritten
          : completed.has(assignment.id)
            ? styles.cellDone
            : attempts[assignment.id]?.failedQueries.length
              ? styles.cellAttempted
              : "";
        return (
          <span key={position} style={{ display: "contents" }}>
            {position === group.requiredPlanned + 1 && <span className={styles.cellGap} />}
            <span className={`${styles.cell} ${stateClass}`} />
          </span>
        );
      })}
    </span>
  );
}

function GroupRow({ group, defaultOpen }: { group: Group; defaultOpen: boolean }) {
  const { completed } = useProgress();
  const { done, available, total } = groupProgress(group, completed);
  const extras = group.slots.filter((slot) => !isRequired(slot.assignment) && completed.has(slot.assignment.id)).length;

  if (group.slots.length === 0) {
    return (
      <li className={`${styles.skill} ${styles.skillPlain}`}>
        <span />
        <span />
        <span className={styles.skillTitle}>
          {group.title}
          {group.outcome && <span className={styles.skillOutcome}>{group.outcome}</span>}
        </span>
        <span className={styles.count}>Not written yet</span>
      </li>
    );
  }

  const countText =
    available < total && group.kind !== "skill" ? `${done}/${total} · ${available} available` : `${done}/${total}`;

  return (
    <li className={styles.skill}>
      <details open={defaultOpen}>
        <summary className={styles.skillSummary}>
          <span className={styles.chevron} style={{ display: "inline-flex" }}>
            <ChevronRightIcon />
          </span>
          <span
            style={{ display: "inline-flex", color: done > 0 && done === total ? "var(--success)" : "var(--text-muted)" }}
          >
            {done > 0 && done === total ? <DoneIcon /> : done > 0 ? <AttemptedIcon /> : <NotStartedIcon />}
          </span>
          <span className={styles.skillTitle}>
            {group.title}
            {group.outcome && <span className={styles.skillOutcome}>{group.outcome}</span>}
          </span>
          <GroupCells group={group} />
          <span className={styles.count}>
            {countText}
            {extras > 0 && ` · +${extras} extra`}
          </span>
        </summary>
        <ul className={styles.assignments}>
          {group.slots.map(({ position, assignment }) => (
            <li key={assignment.id}>
              <a className={styles.assignmentRow} href={`#/a/${assignment.id}`}>
                <StatusIcon assignment={assignment} />
                <span className={styles.assignmentTitle}>
                  {position}. {assignment.title}
                </span>
                <span className={styles.assignmentType}>{typeLabel(assignment)}</span>
                <span className={styles.extraTag}>{isRequired(assignment) ? "" : "Extra"}</span>
              </a>
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}

function StageRow({ stage, open, focused }: { stage: Stage; open: boolean; focused: boolean }) {
  const { completed } = useProgress();
  const progress = stageProgress(stage, completed);
  const ref = useRef<HTMLDetailsElement>(null);
  const continueTarget = firstIncompleteRequired(completed);

  useEffect(() => {
    if (focused) ref.current?.scrollIntoView();
  }, [focused]);

  const label =
    progress.available === 0
      ? `${progress.done}/${progress.total} · Not written yet`
      : `${progress.done}/${progress.total} · ${progress.available} available`;

  return (
    <details ref={ref} className={styles.stage} open={open}>
      <summary className={styles.stageSummary}>
        <span className={styles.chevron} style={{ display: "inline-flex" }}>
          <ChevronRightIcon />
        </span>
        <h2 className={styles.stageName}>
          <span className={styles.stageNumber}>Stage {stage.id}</span>
          {stage.title}
        </h2>
        <span className={styles.count}>{label}</span>
        <span className={styles.stageBar}>
          <ProgressBar progress={progress} name={`Stage ${stage.id} progress`} size="small" />
        </span>
      </summary>
      <ul className={styles.skills}>
        {stage.groups.map((group) => (
          <GroupRow
            key={group.id}
            group={group}
            defaultOpen={group.slots.some((slot) => slot.assignment.id === continueTarget?.id)}
          />
        ))}
      </ul>
    </details>
  );
}

export function LandingPage({ focusStage }: { focusStage?: number }) {
  const { completed } = useProgress();
  const overall = overallProgress(completed);
  const extras = extraDone(completed);
  const continueTarget = firstIncompleteRequired(completed);
  const openStage =
    focusStage ?? stages.find((stage) => stage.groups.some((group) => group.slots.some((slot) => slot.assignment.id === continueTarget?.id)))?.id;

  return (
    <div className={styles.landing}>
      <section className={styles.intro}>
        <div>
          <h1 className={styles.title}>Learn SQL by writing it</h1>
          <p className={styles.subtitle}>Short, hands-on assignments that run in your browser. Nothing to install.</p>
        </div>
        <ContinueAction />
      </section>

      <section className={styles.overall} aria-label="Overall progress">
        <p className={styles.overallLabel}>
          <span className={styles.overallName}>Inner Joy progress</span>
          <span className={ui.muted}>
            {overall.done} of {overall.total} required · {overall.available} available now
            {extras > 0 && ` · ${extras} extra done`}
          </span>
        </p>
        <ProgressBar progress={overall} name="Overall Inner Joy progress" size="large" />
      </section>

      {/* Remounting on focus changes applies the requested open stage. */}
      <div key={focusStage ?? "default"}>
        {stages.map((stage) => (
          <StageRow key={stage.id} stage={stage} open={stage.id === openStage} focused={stage.id === focusStage} />
        ))}
      </div>

      <p className={styles.playgroundLine}>
        Want to experiment freely? <a href="#/playground">Open the playground</a>.
      </p>
    </div>
  );
}
