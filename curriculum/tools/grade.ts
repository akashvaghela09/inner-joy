import type { Database, SqlJsStatic } from "sql.js";

export type Value = string | number | null;
export type ResultSet = { columns: string[]; rows: Value[][] };

export type Dataset = {
  id: string;
  title: string;
  story: string;
  schemaSql: string;
  seedSql: string;
};

export type Check = {
  mode: "result" | "table";
  ordered: boolean;
  columnNames: boolean;
  decimals?: number;
  /** Required for "table" mode: reads the final state after the learner's SQL. */
  sql?: string;
};

export type TestCase = {
  name: string;
  hidden: boolean;
  setupSql?: string;
  expected: ResultSet;
};

export type Assignment = {
  id: string;
  /** Omitted for ordinary skill assignments. */
  kind?: "review" | "checkpoint";
  // Skill assignments only.
  skill?: number;
  step?: number;
  stepType?: string;
  required?: boolean;
  // Reviews and checkpoints only.
  stage?: number;
  skills?: number[];
  /** A checkpoint's concept source, numbered as in docs/sql-50-assessment.md. */
  sourceProblem?: number;
  recalls: number[];
  title: string;
  prompt: string;
  dataset: string;
  starterSql?: string;
  hints: string[];
  check: Check;
  cases: TestCase[];
  solutions: string[];
  wrongSolutions: { sql: string; why: string }[];
};

export type CaseOutcome = { passed: boolean; actual?: ResultSet; error?: string };

export function runStatements(db: Database, sql: string): ResultSet[] {
  const results: ResultSet[] = [];
  // Stepping each statement keeps the columns of a SELECT that returns no rows.
  for (const stmt of db.iterateStatements(sql)) {
    const columns = stmt.getColumnNames();
    const rows: Value[][] = [];
    while (stmt.step()) rows.push(stmt.get() as Value[]);
    if (columns.length > 0) results.push({ columns, rows });
  }
  return results;
}

/** SQLite parses REGEXP but leaves the function for the application to provide. */
export function registerRegexp(db: Database) {
  db.create_function("regexp", (pattern: string, value: unknown) =>
    value !== null && new RegExp(pattern).test(String(value)) ? 1 : 0,
  );
}

export function createCaseDb(SQL: SqlJsStatic, dataset: Dataset, testCase?: TestCase): Database {
  const db = new SQL.Database();
  registerRegexp(db);
  db.run(dataset.schemaSql);
  db.run(dataset.seedSql);
  if (testCase?.setupSql) db.run(testCase.setupSql);
  return db;
}

function normalise(rows: Value[][], check: Check): string[] {
  const { decimals } = check;
  const values = rows.map((row) =>
    JSON.stringify(
      row.map((value) => (typeof value === "number" && decimals !== undefined ? Number(value.toFixed(decimals)) : value)),
    ),
  );
  return check.ordered ? values : values.sort();
}

export function resultsMatch(actual: ResultSet, expected: ResultSet, check: Check): boolean {
  if (actual.columns.length !== expected.columns.length) return false;
  if (check.columnNames && actual.columns.some((name, index) => name !== expected.columns[index])) return false;
  const actualRows = normalise(actual.rows, check);
  const expectedRows = normalise(expected.rows, check);
  return actualRows.length === expectedRows.length && actualRows.every((row, index) => row === expectedRows[index]);
}

export function runCase(SQL: SqlJsStatic, dataset: Dataset, assignment: Assignment, testCase: TestCase, sql: string): CaseOutcome {
  const { check } = assignment;
  const db = createCaseDb(SQL, dataset, testCase);
  try {
    let actual: ResultSet | undefined;
    try {
      actual = runStatements(db, sql).at(-1);
      if (check.mode === "table") actual = runStatements(db, check.sql ?? "").at(-1);
    } catch (err) {
      return { passed: false, error: err instanceof Error ? err.message : String(err) };
    }

    if (!actual) return { passed: false, error: "The query didn't return any results." };
    return { passed: resultsMatch(actual, testCase.expected, check), actual };
  } finally {
    db.close();
  }
}

export function passesAllCases(SQL: SqlJsStatic, dataset: Dataset, assignment: Assignment, sql: string): boolean {
  return assignment.cases.every((testCase) => runCase(SQL, dataset, assignment, testCase, sql).passed);
}
