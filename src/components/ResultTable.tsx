import styles from "../app.module.css";

export function ResultTable({ columns, rows }: { columns: (string | { name: string; type: string })[]; rows: unknown[][] }) {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column, index) =>
              typeof column === "string" ? (
                <th key={index}>{column}</th>
              ) : (
                <th key={index}>
                  {column.name}
                  <span className={styles.columnType}>{column.type}</span>
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((value, columnIndex) => (
                <td key={columnIndex}>{value === null ? <span className={styles.null}>NULL</span> : String(value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
