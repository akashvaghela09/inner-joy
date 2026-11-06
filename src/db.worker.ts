import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { createProblemDb, errorMessage, grade, readFinalTable } from "./grader";
import { deleteDuplicateEmails as problem } from "./problems/deleteDuplicateEmails";
import type { RunOutcome, StatementResult, WorkerOutcome, WorkerRequest, WorkerResponse } from "./protocol";
import { SEED_SQL } from "./seed";

const sqlPromise = initSqlJs({ locateFile: () => wasmUrl });

const playgroundPromise = sqlPromise.then((SQL) => {
  const db = new SQL.Database();
  db.run(SEED_SQL);
  return db;
});

function totalChanges(db: Database): number {
  return db.exec("SELECT total_changes()")[0].values[0][0] as number;
}

function run(db: Database, sql: string): RunOutcome {
  const changesBefore = totalChanges(db);
  const results: StatementResult[] = [];

  // Stepping each statement keeps the column headers of a SELECT with no rows,
  // which db.exec() would drop.
  for (const stmt of db.iterateStatements(sql)) {
    const columns = stmt.getColumnNames();
    const rows: unknown[][] = [];
    while (stmt.step()) rows.push(stmt.get());
    if (columns.length > 0) results.push({ columns, rows });
  }

  return { kind: "run", results, rowsChanged: totalChanges(db) - changesBefore };
}

/** Runs against a fresh copy of the sample data, so each attempt starts clean. */
function tryProblem(SQL: SqlJsStatic, sql: string): RunOutcome {
  const sample = problem.cases.find((testCase) => !testCase.hidden);
  if (!sample) throw new Error(`${problem.title} has no visible sample case`);

  const db = createProblemDb(SQL, problem, sample.input);
  try {
    const outcome = run(db, sql);
    outcome.results.push({
      label: `${problem.table} after your SQL`,
      columns: problem.columns,
      rows: readFinalTable(db, problem),
    });
    return outcome;
  } finally {
    db.close();
  }
}

async function handle({ kind, sql }: WorkerRequest): Promise<WorkerOutcome> {
  switch (kind) {
    case "playground":
      return run(await playgroundPromise, sql);
    case "tryProblem":
      return tryProblem(await sqlPromise, sql);
    case "checkProblem":
      return { kind: "check", report: grade(await sqlPromise, problem, sql) };
  }
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  let outcome: WorkerOutcome;
  try {
    outcome = await handle(event.data);
  } catch (err) {
    outcome = { kind: "error", error: errorMessage(err) };
  }
  const response: WorkerResponse = { id: event.data.id, outcome };
  self.postMessage(response);
};
