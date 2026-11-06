import type { ReactNode } from "react";
import styles from "../app.module.css";
import type { CaseReport, CheckOutcome, ErrorOutcome, RunOutcome } from "../protocol";
import { ResultTable } from "./ResultTable";

type Props = {
  outcome: RunOutcome | CheckOutcome | ErrorOutcome;
  /** Shown beside a passing verdict, such as a link to the next assignment. */
  passAction?: ReactNode;
};

export function Outcome({ outcome, passAction }: Props) {
  switch (outcome.kind) {
    case "error":
      return <pre role="alert" className={styles.error}>{outcome.error}</pre>;
    case "run":
      return <RunResults outcome={outcome} />;
    case "check":
      return <CheckResults outcome={outcome} passAction={passAction} />;
  }
}

function RunResults({ outcome }: { outcome: RunOutcome }) {
  return (
    <section aria-label="Query results">
      {outcome.results.map((result, index) => (
        <div key={index} className={styles.resultBlock}>
          {result.label && <h3 className={styles.resultLabel}>{result.label}</h3>}
          <ResultTable columns={result.columns} rows={result.rows} />
          <p className={styles.meta}>
            {result.rows.length} {result.rows.length === 1 ? "row" : "rows"}
          </p>
        </div>
      ))}
      <p className={styles.meta}>Rows changed: {outcome.rowsChanged}</p>
    </section>
  );
}

function CheckResults({ outcome, passAction }: { outcome: CheckOutcome; passAction?: ReactNode }) {
  const passedCount = outcome.cases.filter((result) => result.passed).length;
  return (
    <section aria-label="Check results">
      <div role="status" className={`${styles.verdict} ${outcome.passed ? styles.verdictPass : styles.verdictFail}`}>
        <span>
          {outcome.passed ? "Correct!" : "Not quite."} {passedCount} of {outcome.cases.length} tests passed
        </span>
        {outcome.passed && passAction}
      </div>
      <ul className={styles.caseList}>
        {outcome.cases.map((result) => (
          <CaseRow key={result.name} result={result} />
        ))}
      </ul>
    </section>
  );
}

function CaseRow({ result }: { result: CaseReport }) {
  return (
    <li className={styles.caseItem}>
      <span className={result.passed ? styles.casePass : styles.caseFail}>{result.passed ? "Passed" : "Failed"}</span>{" "}
      {result.name}
      {result.hidden && <span className={styles.hiddenTag}> (hidden test)</span>}
      {result.error && <pre className={styles.error}>{result.error}</pre>}
      {!result.passed && !result.error && result.expected && result.actual && (
        <div className={styles.compare}>
          <div>
            <h4 className={styles.compareTitle}>Expected</h4>
            <ResultTable columns={result.expected.columns} rows={result.expected.rows} />
          </div>
          <div>
            <h4 className={styles.compareTitle}>Your result</h4>
            <ResultTable columns={result.actual.columns} rows={result.actual.rows} />
          </div>
        </div>
      )}
    </li>
  );
}
