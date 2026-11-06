import { useEffect, useState } from "react";
import type { Dataset } from "../../curriculum/tools/grade";
import styles from "../app.module.css";
import type { TableDescription } from "../protocol";
import { sendToWorker } from "../workerClient";
import { ResultTable } from "./ResultTable";

export function DataPanel({ dataset }: { dataset: Dataset }) {
  const [tables, setTables] = useState<TableDescription[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setTables(null);
    setError(null);
    sendToWorker({ op: "describe", dataset }).then((outcome) => {
      if (!active) return;
      if (outcome.kind === "describe") setTables(outcome.tables);
      else if (outcome.kind === "error") setError(outcome.error);
    });
    return () => {
      active = false;
    };
  }, [dataset]);

  return (
    <details className={styles.panel} open>
      <summary>Data: {dataset.title}</summary>
      <div className={styles.panelBody}>
        <p className={styles.story}>{dataset.story}</p>
        {error && <pre role="alert" className={styles.error}>{error}</pre>}
        {tables?.map((table) => (
          <div key={table.name}>
            <h3 className={styles.tableName}>{table.name}</h3>
            <ResultTable columns={table.columns} rows={table.rows} />
          </div>
        ))}
      </div>
    </details>
  );
}
