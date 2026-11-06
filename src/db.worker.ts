import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { createCaseDb, runCase, runStatements, type Assignment, type Dataset } from "../curriculum/tools/grade";
import type {
  CaseReport,
  CheckOutcome,
  DescribeOutcome,
  RunOutcome,
  WorkerOutcome,
  WorkerRequest,
  WorkerResponse,
} from "./protocol";
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
  const results = runStatements(db, sql);
  return { kind: "run", results, rowsChanged: totalChanges(db) - changesBefore };
}

/** Runs against a fresh copy of the visible data, so each attempt starts clean. */
function tryAssignment(SQL: SqlJsStatic, dataset: Dataset, assignment: Assignment, sql: string): RunOutcome {
  const visible = assignment.cases.find((testCase) => !testCase.hidden);
  const db = createCaseDb(SQL, dataset, visible);
  try {
    const outcome = run(db, sql);
    const { check } = assignment;
    if (check.mode === "table" && check.sql) {
      for (const result of runStatements(db, check.sql)) {
        outcome.results.push({ ...result, label: "Table after your SQL" });
      }
    }
    return outcome;
  } finally {
    db.close();
  }
}

function checkAssignment(SQL: SqlJsStatic, dataset: Dataset, assignment: Assignment, sql: string): CheckOutcome {
  const cases = assignment.cases.map((testCase): CaseReport => {
    const { name, hidden, expected } = testCase;
    const { passed, actual, error } = runCase(SQL, dataset, assignment, testCase, sql);
    return hidden ? { name, hidden, passed, error } : { name, hidden, passed, error, expected, actual };
  });
  return { kind: "check", passed: cases.every((result) => result.passed), cases };
}

function describe(SQL: SqlJsStatic, dataset: Dataset): DescribeOutcome {
  const db = createCaseDb(SQL, dataset);
  try {
    const names = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY rowid")[0].values.map(
      ([name]) => name as string,
    );
    const tables = names.map((name) => {
      const quoted = `"${name.replace(/"/g, '""')}"`;
      const columns = db.exec(`PRAGMA table_info(${quoted})`)[0].values.map((column) => ({
        name: column[1] as string,
        type: column[2] as string,
      }));
      const rows = runStatements(db, `SELECT * FROM ${quoted}`)[0].rows;
      return { name, columns, rows };
    });
    return { kind: "describe", tables };
  } finally {
    db.close();
  }
}

async function handle(request: WorkerRequest): Promise<WorkerOutcome> {
  const SQL = await sqlPromise;
  switch (request.op) {
    case "playground":
      return run(await playgroundPromise, request.sql);
    case "try":
      return tryAssignment(SQL, request.dataset, request.assignment, request.sql);
    case "check":
      return checkAssignment(SQL, request.dataset, request.assignment, request.sql);
    case "describe":
      return describe(SQL, request.dataset);
  }
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  let outcome: WorkerOutcome;
  try {
    outcome = await handle(event.data);
  } catch (err) {
    outcome = { kind: "error", error: err instanceof Error ? err.message : String(err) };
  }
  const response: WorkerResponse = { id: event.data.id, outcome };
  self.postMessage(response);
};
