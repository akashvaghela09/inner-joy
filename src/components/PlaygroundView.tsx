import { useState } from "react";
import styles from "../app.module.css";
import type { ErrorOutcome, RunOutcome } from "../protocol";
import { sendToWorker } from "../workerClient";
import { Outcome } from "./Outcome";
import { SqlEditor } from "./SqlEditor";

const STARTER = `SELECT e.name, d.name AS department, e.salary
FROM employees e
LEFT JOIN departments d ON d.id = e.department_id
ORDER BY e.salary DESC;`;

export function PlaygroundView() {
  const [sql, setSql] = useState(STARTER);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunOutcome | ErrorOutcome | null>(null);
  const isEmpty = sql.trim() === "";

  async function run() {
    if (running || isEmpty) return;
    setRunning(true);
    const outcome = await sendToWorker({ op: "playground", sql });
    if (outcome.kind === "run" || outcome.kind === "error") setResult(outcome);
    setRunning(false);
  }

  return (
    <article>
      <h1 className={styles.title}>Playground</h1>
      <p className={styles.prompt}>Try anything here. Changes last until you reload the page.</p>
      <p className={styles.recall}>
        Tables: <code>departments(id, name)</code>, <code>employees(id, name, department_id, salary, hire_date)</code>
      </p>
      <SqlEditor value={sql} onChange={setSql} onRun={run} />
      <div className={styles.actions}>
        <button className={styles.primaryButton} onClick={run} disabled={running || isEmpty}>
          Run (Ctrl+Enter)
        </button>
        {running && <span className={styles.status}>Running…</span>}
      </div>
      {result && <Outcome outcome={result} />}
    </article>
  );
}
