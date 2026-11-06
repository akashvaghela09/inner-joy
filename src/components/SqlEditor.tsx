import type { KeyboardEvent, ReactNode } from "react";
import ui from "../ui.module.css";

type Props = {
  value: string;
  onChange: (sql: string) => void;
  onRun: () => void;
  onCheck?: () => void;
  headerActions?: ReactNode;
};

export function SqlEditor({ value, onChange, onRun, onCheck, headerActions }: Props) {
  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    if (event.shiftKey && onCheck) onCheck();
    else onRun();
  }

  return (
    <div className={ui.editorBox}>
      <div className={ui.editorHeader}>
        <span>query.sql</span>
        <div className={ui.editorHeaderActions}>{headerActions}</div>
      </div>
      <textarea
        className={ui.editor}
        aria-label="SQL query"
        placeholder="Write your SQL here"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        rows={6}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
    </div>
  );
}
