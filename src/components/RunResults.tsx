import type { RunOutcome } from "../protocol";
import wb from "../workbench.module.css";
import { ResultTable } from "./ResultTable";

export function RunResults({ outcome }: { outcome: RunOutcome }) {
  const { results, rowsChanged } = outcome;
  return (
    <>
      {results.map((result, index) => (
        <div key={index} className={wb.resultBlock}>
          {result.label && <h3 className={wb.resultLabel}>{result.label}</h3>}
          <ResultTable columns={result.columns} rows={result.rows} />
          {result.rows.length > 0 && (
            <p className={wb.meta}>
              {result.rows.length} {result.rows.length === 1 ? "row" : "rows"}
            </p>
          )}
        </div>
      ))}
      {rowsChanged > 0 && <p className={wb.meta}>Rows changed: {rowsChanged}</p>}
      {results.length === 0 && rowsChanged === 0 && <p className={wb.meta}>The query ran, with no rows to show.</p>}
    </>
  );
}
