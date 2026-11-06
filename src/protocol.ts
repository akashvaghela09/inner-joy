import type { GradeReport } from "./grader";

export type StatementResult = {
  label?: string;
  columns: string[];
  rows: unknown[][];
};

export type WorkerRequestKind = "playground" | "tryProblem" | "checkProblem";

export type WorkerRequest = {
  id: number;
  kind: WorkerRequestKind;
  sql: string;
};

export type RunOutcome = { kind: "run"; results: StatementResult[]; rowsChanged: number };
export type CheckOutcome = { kind: "check"; report: GradeReport };
export type ErrorOutcome = { kind: "error"; error: string };
export type WorkerOutcome = RunOutcome | CheckOutcome | ErrorOutcome;

export type WorkerResponse = {
  id: number;
  outcome: WorkerOutcome;
};
