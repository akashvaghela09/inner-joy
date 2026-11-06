import type { Assignment, Dataset, ResultSet } from "../curriculum/tools/grade";

export type WorkerRequestBody =
  | { op: "playground"; sql: string }
  | { op: "try"; sql: string; dataset: Dataset; assignment: Assignment }
  | { op: "check"; sql: string; dataset: Dataset; assignment: Assignment }
  | { op: "describe"; dataset: Dataset }
  | { op: "example"; sql: string; dataset: Dataset };

export type WorkerRequest = WorkerRequestBody & { id: number };

export type LabelledResult = ResultSet & { label?: string };

export type CaseReport = {
  name: string;
  hidden: boolean;
  passed: boolean;
  error?: string;
  /** Left out for hidden cases so their data stays hidden. */
  expected?: ResultSet;
  actual?: ResultSet;
};

export type TableDescription = {
  name: string;
  columns: { name: string; type: string }[];
  rows: ResultSet["rows"];
};

export type RunOutcome = { kind: "run"; results: LabelledResult[]; rowsChanged: number };
export type CheckOutcome = { kind: "check"; passed: boolean; cases: CaseReport[] };
export type DescribeOutcome = { kind: "describe"; tables: TableDescription[] };
export type ErrorOutcome = { kind: "error"; error: string };
export type WorkerOutcome = RunOutcome | CheckOutcome | DescribeOutcome | ErrorOutcome;

export type WorkerResponse = { id: number; outcome: WorkerOutcome };
