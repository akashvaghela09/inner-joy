import ui from "../ui.module.css";

type Column = string | { name: string; type: string };

export function ResultTable({ columns, rows }: { columns: Column[]; rows: unknown[][] }) {
  return (
    <div className={ui.tableBox}>
      <table className={ui.table}>
        <thead>
          <tr>
            {columns.map((column, index) =>
              typeof column === "string" ? (
                <th key={index}>{column}</th>
              ) : (
                <th key={index}>
                  {column.name}
                  <span className={ui.columnType}>{column.type}</span>
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((value, columnIndex) => (
                <td key={columnIndex}>{value === null ? <span className={ui.null}>NULL</span> : String(value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className={ui.emptyRows}>0 rows returned</p>}
    </div>
  );
}
