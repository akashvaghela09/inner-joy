import { useState } from "react";
import type { Dataset } from "../../curriculum/tools/grade";
import type { ErrorOutcome, RunOutcome } from "../protocol";
import { SEED_SQL } from "../seed";
import ui from "../ui.module.css";
import { useIsDesktop } from "../useIsDesktop";
import wb from "../workbench.module.css";
import { sendToWorker } from "../workerClient";
import { DataSection } from "./DataSection";
import { RunResults } from "./RunResults";
import { SqlEditor } from "./SqlEditor";

const STARTER = `SELECT e.name, d.name AS department, e.salary
FROM employees e
LEFT JOIN departments d ON d.id = e.department_id
ORDER BY e.salary DESC;`;

const DATASET: Dataset = {
  id: "playground",
  title: "Sample company",
  story: "Two connected tables to experiment with. These are the starting rows.",
  schemaSql: SEED_SQL,
  seedSql: "",
};

export function PlaygroundView() {
  const isDesktop = useIsDesktop();
  const [sql, setSql] = useState(STARTER);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ sql: string; outcome: RunOutcome | ErrorOutcome } | null>(null);
  const isEmpty = sql.trim() === "";

  async function run() {
    if (running || isEmpty) return;
    const submitted = sql;
    setRunning(true);
    const outcome = await sendToWorker({ op: "playground", sql: submitted });
    setRunning(false);
    if (outcome.kind === "run" || outcome.kind === "error") setResult({ sql: submitted, outcome });
  }

  const data = <DataSection dataset={DATASET} label={`Data: ${DATASET.title}`} />;

  return (
    <div className={wb.split}>
      <div className={wb.left}>
        <h1 className={wb.title}>Playground</h1>
        <p className={wb.stepLine}>Nothing here is graded. Changes last until you reload the page.</p>
        {isDesktop && data}
      </div>
      <div className={wb.right}>
        <div className={wb.editorSlot}>
          <SqlEditor value={sql} onChange={setSql} onRun={run} />
        </div>
        <div className={wb.actions}>
          <button type="button" className={`${ui.button} ${ui.primary}`} onClick={run} disabled={isEmpty} aria-busy={running}>
            Run <span className={ui.keyHint}>Ctrl+Enter</span>
          </button>
          {running && <span className={wb.running}>Running…</span>}
        </div>
        <section className={wb.playgroundResults} aria-label="Results" aria-live="polite">
          {!result && <p className={wb.empty}>Run your query to see rows here.</p>}
          {result && result.sql !== sql && <p className={wb.stale}>From your previous query</p>}
          {result?.outcome.kind === "error" && (
            <pre role="alert" className={ui.errorBox}>
              {result.outcome.error}
            </pre>
          )}
          {result?.outcome.kind === "run" && <RunResults outcome={result.outcome} />}
        </section>
        {!isDesktop && <div style={{ padding: 16 }}>{data}</div>}
      </div>
    </div>
  );
}
