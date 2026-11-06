import { useEffect, useState } from "react";
import type { Dataset } from "../../curriculum/tools/grade";
import type { TableDescription } from "../protocol";
import ui from "../ui.module.css";
import wb from "../workbench.module.css";
import { sendToWorker } from "../workerClient";
import { ResultTable } from "./ResultTable";

export function DataSection({ dataset, label }: { dataset: Dataset; label: string }) {
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
    <section aria-label={label}>
      <h2 className={wb.sectionLabel}>{label}</h2>
      <p className={wb.story}>{dataset.story}</p>
      {error && (
        <pre role="alert" className={ui.errorBox}>
          {error}
        </pre>
      )}
      {tables?.map((table) => (
        <div key={table.name}>
          <h3 className={wb.tableName}>{table.name}</h3>
          <ResultTable columns={table.columns} rows={table.rows} />
        </div>
      ))}
    </section>
  );
}
