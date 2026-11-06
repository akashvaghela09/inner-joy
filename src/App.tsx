import { useState, type KeyboardEvent } from "react";
import type { CaseResult } from "./grader";
import { deleteDuplicateEmails as problem } from "./problems/deleteDuplicateEmails";
import type { WorkerOutcome, WorkerRequestKind } from "./protocol";
import { sendToWorker } from "./workerClient";

const PLAYGROUND_STARTER = `SELECT e.name, d.name AS department, e.salary
FROM employees e
LEFT JOIN departments d ON d.id = e.department_id
ORDER BY e.salary DESC;`;

type View = "problem" | "playground";

export function App() {
  const [view, setView] = useState<View>("problem");

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 16, fontFamily: "sans-serif" }}>
      <h1>Inner Joy</h1>
      <nav style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setView("problem")} aria-pressed={view === "problem"}>
          Problem
        </button>
        <button onClick={() => setView("playground")} aria-pressed={view === "playground"}>
          Playground
        </button>
      </nav>
      {/* Both views stay mounted so switching keeps the typed SQL and output. */}
      <div hidden={view !== "problem"}>
        <ProblemView />
      </div>
      <div hidden={view !== "playground"}>
        <PlaygroundView />
      </div>
    </main>
  );
}

function useSqlRunner(initialSql: string) {
  const [sql, setSql] = useState(initialSql);
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<WorkerOutcome | null>(null);

  async function send(kind: WorkerRequestKind) {
    if (running) return;
    setRunning(true);
    setOutcome(await sendToWorker(kind, sql));
    setRunning(false);
  }

  return { sql, setSql, running, outcome, send };
}

function SqlEditor(props: { value: string; onChange: (sql: string) => void; onRun: () => void }) {
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      props.onRun();
    }
  }

  return (
    <textarea
      aria-label="SQL query"
      placeholder="Write your SQL here"
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
      onKeyDown={onKeyDown}
      rows={8}
      spellCheck={false}
      style={{ width: "100%", boxSizing: "border-box", fontFamily: "monospace", fontSize: 14 }}
    />
  );
}

function PlaygroundView() {
  const { sql, setSql, running, outcome, send } = useSqlRunner(PLAYGROUND_STARTER);
  const run = () => send("playground");

  return (
    <section>
      <p>
        Tables: <code>departments(id, name)</code>,{" "}
        <code>employees(id, name, department_id, salary, hire_date)</code>. Changes last until you
        reload the page.
      </p>
      <SqlEditor value={sql} onChange={setSql} onRun={run} />
      <p>
        <button onClick={run} disabled={running}>
          {running ? "Running…" : "Run (Ctrl+Enter)"}
        </button>
      </p>
      {outcome && <Outcome outcome={outcome} />}
    </section>
  );
}

function ProblemView() {
  const { sql, setSql, running, outcome, send } = useSqlRunner("");
  const tryIt = () => send("tryProblem");
  const sample = problem.cases.find((testCase) => !testCase.hidden);

  return (
    <section>
      <h2>{problem.title}</h2>
      {problem.description.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <p>
        Table: <code>{`${problem.table}(${problem.columns.join(", ")})`}</code>
      </p>
      {sample && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginBottom: 16 }}>
          <div>
            <h3>Sample before</h3>
            <ResultTable columns={problem.columns} rows={sample.input} />
          </div>
          <div>
            <h3>Sample after</h3>
            <ResultTable columns={problem.columns} rows={sample.expected} />
          </div>
        </div>
      )}
      <SqlEditor value={sql} onChange={setSql} onRun={tryIt} />
      <p style={{ display: "flex", gap: 8 }}>
        <button onClick={tryIt} disabled={running}>
          Run on sample (Ctrl+Enter)
        </button>
        <button onClick={() => send("checkProblem")} disabled={running}>
          Check answer
        </button>
        {running && <span>Running…</span>}
      </p>
      {outcome && <Outcome outcome={outcome} />}
    </section>
  );
}

function Outcome({ outcome }: { outcome: WorkerOutcome }) {
  switch (outcome.kind) {
    case "error":
      return <ErrorMessage message={`Error: ${outcome.error}`} />;
    case "check":
      return (
        <section aria-label="Check results">
          <VerdictHeading cases={outcome.report.cases} passed={outcome.report.passed} />
          <ul style={{ listStyle: "none", padding: 0 }}>
            {outcome.report.cases.map((result) => (
              <CaseRow key={result.name} result={result} />
            ))}
          </ul>
        </section>
      );
    case "run":
      return (
        <section aria-label="Query results">
          {outcome.results.map((result, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              {result.label && <h3>{result.label}</h3>}
              <ResultTable columns={result.columns} rows={result.rows} />
              <small>
                {result.rows.length} {result.rows.length === 1 ? "row" : "rows"}
              </small>
            </div>
          ))}
          <p>
            <small>Rows changed: {outcome.rowsChanged}</small>
          </p>
        </section>
      );
  }
}

function VerdictHeading({ cases, passed }: { cases: CaseResult[]; passed: boolean }) {
  const passedCount = cases.filter((result) => result.passed).length;
  return (
    <h3 style={{ color: passed ? "#1b6e2c" : "#b00020" }}>
      {passed ? "PASS" : "FAIL"}: {passedCount} of {cases.length} tests passed
    </h3>
  );
}

function CaseRow({ result }: { result: CaseResult }) {
  return (
    <li style={{ marginBottom: 8 }}>
      <strong style={{ color: result.passed ? "#1b6e2c" : "#b00020" }}>
        {result.passed ? "Passed" : "Failed"}
      </strong>{" "}
      {result.name}
      {result.hidden && <small> (hidden)</small>}
      {result.error && <ErrorMessage message={result.error} />}
      {!result.passed && result.expected && result.actual && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginTop: 8 }}>
          <div>
            <h4>Expected</h4>
            <ResultTable columns={problem.columns} rows={result.expected} />
          </div>
          <div>
            <h4>Your table</h4>
            <ResultTable columns={problem.columns} rows={result.actual} />
          </div>
        </div>
      )}
    </li>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <pre role="alert" style={{ color: "#b00020", whiteSpace: "pre-wrap" }}>
      {message}
    </pre>
  );
}

function ResultTable({ columns, rows }: { columns: string[]; rows: unknown[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((column, columnIndex) => (
              <th key={columnIndex}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((value, columnIndex) => (
                <td key={columnIndex}>{value === null ? <em>NULL</em> : String(value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
