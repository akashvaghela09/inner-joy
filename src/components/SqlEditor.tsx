import type { KeyboardEvent } from "react";
import styles from "../app.module.css";

type Props = {
  value: string;
  onChange: (sql: string) => void;
  onRun: () => void;
};

export function SqlEditor({ value, onChange, onRun }: Props) {
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      onRun();
    }
  }

  return (
    <textarea
      className={styles.editor}
      aria-label="SQL query"
      placeholder="Write your SQL here"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      rows={7}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
    />
  );
}
