import type { Database, SqlJsStatic } from "sql.js";

export type Row = (string | number | null)[];

export type ProblemCase = {
  name: string;
  hidden: boolean;
  input: Row[];
  expected: Row[];
};

export type Problem = {
  title: string;
  description: string[];
  table: string;
  columns: string[];
  createSql: string;
  /** Reads the final table so it can be compared with a case's expected rows. */
  checkSql: string;
  cases: ProblemCase[];
};

export type CaseResult = {
  name: string;
  hidden: boolean;
  passed: boolean;
  error?: string;
  /** Left out for hidden cases so their data is not shown to the learner. */
  expected?: Row[];
  actual?: Row[];
};

export type GradeReport = {
  passed: boolean;
  cases: CaseResult[];
};

export function createProblemDb(SQL: SqlJsStatic, problem: Problem, input: Row[]): Database {
  const db = new SQL.Database();
  db.run(problem.createSql);
  const placeholders = problem.columns.map(() => "?").join(", ");
  for (const row of input) {
    db.run(`INSERT INTO ${problem.table} VALUES (${placeholders})`, row);
  }
  return db;
}

export function readFinalTable(db: Database, problem: Problem): Row[] {
  // db.exec() returns no result set at all when the query matches no rows.
  return (db.exec(problem.checkSql)[0]?.values ?? []) as Row[];
}

function gradeCase(SQL: SqlJsStatic, problem: Problem, testCase: ProblemCase, sql: string): CaseResult {
  const { name, hidden, expected } = testCase;
  const db = createProblemDb(SQL, problem, testCase.input);
  try {
    let actual: Row[];
    try {
      db.run(sql);
    } catch (err) {
      return { name, hidden, passed: false, error: `Your SQL failed: ${errorMessage(err)}` };
    }
    try {
      actual = readFinalTable(db, problem);
    } catch (err) {
      return {
        name,
        hidden,
        passed: false,
        error: `Could not read ${problem.table} after your SQL ran: ${errorMessage(err)}`,
      };
    }
    const passed = JSON.stringify(actual) === JSON.stringify(expected);
    return hidden ? { name, hidden, passed } : { name, hidden, passed, expected, actual };
  } finally {
    db.close();
  }
}

export function grade(SQL: SqlJsStatic, problem: Problem, sql: string): GradeReport {
  const cases = problem.cases.map((testCase) => gradeCase(SQL, problem, testCase, sql));
  return { passed: cases.every((result) => result.passed), cases };
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
