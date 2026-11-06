import { useState } from "react";
import type { Assignment } from "../../curriculum/tools/grade";
import styles from "../app.module.css";
import { datasetFor, describeAssignment, nextAssignment, skillTitle } from "../curriculum";
import type { CheckOutcome, ErrorOutcome, RunOutcome } from "../protocol";
import { loadDraft, markCompleted, saveDraft } from "../storage";
import { sendToWorker } from "../workerClient";
import { DataPanel } from "./DataPanel";
import { Outcome } from "./Outcome";
import { SqlEditor } from "./SqlEditor";

type Result = RunOutcome | CheckOutcome | ErrorOutcome;

export function AssignmentView({ assignment }: { assignment: Assignment }) {
  const dataset = datasetFor(assignment);
  const starter = assignment.starterSql ?? "";
  const [sql, setSql] = useState(() => loadDraft(assignment.id) ?? starter);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [hintsShown, setHintsShown] = useState(0);

  const { eyebrow, badge } = describeAssignment(assignment);
  const next = nextAssignment(assignment.id);
  const isEmpty = sql.trim() === "";
  const recalled = assignment.recalls.map(skillTitle);

  function updateSql(value: string) {
    setSql(value);
    saveDraft(assignment.id, value);
  }

  async function send(op: "try" | "check") {
    if (running || isEmpty) return;
    setRunning(true);
    const outcome = await sendToWorker({ op, sql, dataset, assignment });
    if (outcome.kind === "run" || outcome.kind === "check" || outcome.kind === "error") setResult(outcome);
    if (outcome.kind === "check" && outcome.passed) markCompleted(assignment.id);
    setRunning(false);
  }

  return (
    <article>
      <div className={styles.eyebrowRow}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>
      <h1 className={styles.title}>{assignment.title}</h1>
      <p className={styles.prompt}>{assignment.prompt}</p>
      {recalled.length > 0 && <p className={styles.recall}>Also uses: {recalled.join(", ")}</p>}

      <DataPanel dataset={dataset} />

      <SqlEditor value={sql} onChange={updateSql} onRun={() => send("try")} />

      <div className={styles.actions}>
        <button className={styles.button} onClick={() => send("try")} disabled={running || isEmpty}>
          Run (Ctrl+Enter)
        </button>
        <button className={styles.primaryButton} onClick={() => send("check")} disabled={running || isEmpty}>
          Check answer
        </button>
        <button
          className={styles.button}
          onClick={() => setHintsShown((count) => count + 1)}
          disabled={hintsShown >= assignment.hints.length}
        >
          {hintsShown === 0 ? "Show a hint" : hintsShown < assignment.hints.length ? "Next hint" : "No more hints"}
        </button>
        <button
          className={styles.button}
          onClick={() => {
            updateSql(starter);
            setResult(null);
          }}
          disabled={sql === starter}
        >
          Reset
        </button>
        {running && <span className={styles.status}>Running…</span>}
      </div>

      {hintsShown > 0 && (
        <ul className={styles.hints}>
          {assignment.hints.slice(0, hintsShown).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      )}

      {result && (
        <Outcome
          outcome={result}
          passAction={
            next ? (
              <a className={styles.primaryButton} href={`#/a/${next.id}`}>
                Next: {next.title}
              </a>
            ) : undefined
          }
        />
      )}
    </article>
  );
}
