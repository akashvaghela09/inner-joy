import { useEffect, useState } from "react";
import type { Assignment } from "../../curriculum/tools/grade";
import {
  datasetFor,
  groupOf,
  isRequired,
  nextAssignment,
  nextSteps,
  previousAssignment,
  stages,
  typeLabel,
} from "../curriculum";
import type { CheckOutcome, ErrorOutcome, RunOutcome } from "../protocol";
import { loadDraft, markCompleted, recordFailedCheck, saveDraft, useProgress } from "../storage";
import ui from "../ui.module.css";
import { useIsDesktop } from "../useIsDesktop";
import wb from "../workbench.module.css";
import { sendToWorker } from "../workerClient";
import { AssignmentTabs, PANEL_ID, type TabId } from "./AssignmentTabs";
import { DataSection } from "./DataSection";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";
import { SqlEditor } from "./SqlEditor";
import { StepStrip } from "./StepStrip";

const UNDO_MS = 10_000;
const IS_MAC = /Mac|iPhone|iPad/.test(navigator.userAgent);
const MOD_KEY = IS_MAC ? "⌘" : "Ctrl";

type RunState = { sql: string; outcome: RunOutcome | ErrorOutcome };
type CheckState = { sql: string; outcome: CheckOutcome | ErrorOutcome };

export function AssignmentView({ assignment }: { assignment: Assignment }) {
  const dataset = datasetFor(assignment);
  const group = groupOf(assignment);
  const stage = stages.find((candidate) => candidate.id === group.stageId)!;
  const starter = assignment.starterSql ?? "";

  const isDesktop = useIsDesktop();
  const { completed } = useProgress();
  const [sql, setSql] = useState(() => loadDraft(assignment.id) ?? starter);
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<RunState | null>(null);
  const [check, setCheck] = useState<CheckState | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabId | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [undoSql, setUndoSql] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (undoSql === null) return;
    const timer = setTimeout(() => setUndoSql(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [undoSql]);

  const tabs: TabId[] = isDesktop ? ["results", "tests", "hints", "answer"] : ["data", "results", "tests", "hints", "answer"];
  const defaultTab: TabId = isDesktop ? "results" : "data";
  const activeTab = selectedTab && tabs.includes(selectedTab) ? selectedTab : defaultTab;
  const isOpen = isDesktop ? panelOpen : true;
  const isEmpty = sql.trim() === "";
  const passed = completed.has(assignment.id);
  const previous = previousAssignment(assignment);
  const following = nextAssignment(assignment);
  const { primary: next, extra } = nextSteps(assignment);
  const showNext = passed && next !== undefined;

  function updateSql(value: string) {
    setSql(value);
    saveDraft(assignment.id, value);
  }

  function showTab(tab: TabId) {
    setSelectedTab(tab);
    setPanelOpen(true);
  }

  function revealPanel() {
    if (isDesktop) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    document.getElementById(PANEL_ID)?.scrollIntoView({ behavior, block: "start" });
  }

  async function runQuery() {
    if (running || isEmpty) return;
    const submitted = sql;
    setRunning(true);
    const outcome = await sendToWorker({ op: "try", sql: submitted, dataset, assignment });
    setRunning(false);
    if (outcome.kind !== "run" && outcome.kind !== "error") return;
    setRun({ sql: submitted, outcome });
    showTab("results");
    revealPanel();
    setAnnouncement(outcome.kind === "error" ? `Query failed: ${outcome.error}` : "Query ran. Results are shown.");
  }

  async function checkAnswer() {
    if (running || isEmpty) return;
    const submitted = sql;
    setRunning(true);
    const outcome = await sendToWorker({ op: "check", sql: submitted, dataset, assignment });
    setRunning(false);
    if (outcome.kind !== "check" && outcome.kind !== "error") return;
    setCheck({ sql: submitted, outcome });
    showTab("tests");
    revealPanel();
    if (outcome.kind === "check") {
      if (outcome.passed) markCompleted(assignment.id);
      else recordFailedCheck(assignment.id, submitted);
      const passedCount = outcome.cases.filter((result) => result.passed).length;
      setAnnouncement(`${outcome.passed ? "Correct" : "Not quite"}: ${passedCount} of ${outcome.cases.length} tests passed.`);
    } else {
      setAnnouncement(`Check failed: ${outcome.error}`);
    }
  }

  function reset() {
    setUndoSql(sql);
    updateSql(starter);
  }

  return (
    <>
      <div className={wb.topBar}>
        <nav className={wb.crumbs} aria-label="Breadcrumb">
          <a href={`#/stage/${stage.id}`}>Stage {stage.id}</a>
          <span className={wb.crumbSeparator} aria-hidden="true">
            /
          </span>
          <span className={wb.crumbCurrent}>{group.title}</span>
        </nav>
        <div className={wb.topBarRight}>
          <StepStrip group={group} current={assignment} />
          {previous ? (
            <a className={`${ui.button} ${ui.iconButton}`} href={`#/a/${previous.id}`} aria-label={`Previous: ${previous.title}`} title={`Previous: ${previous.title}`}>
              <ChevronLeftIcon />
            </a>
          ) : (
            <button className={`${ui.button} ${ui.iconButton}`} disabled aria-label="No previous assignment">
              <ChevronLeftIcon />
            </button>
          )}
          {following ? (
            <a className={`${ui.button} ${ui.iconButton}`} href={`#/a/${following.id}`} aria-label={`Next: ${following.title}`} title={`Next: ${following.title}`}>
              <ChevronRightIcon />
            </a>
          ) : (
            <button className={`${ui.button} ${ui.iconButton}`} disabled aria-label="No next assignment">
              <ChevronRightIcon />
            </button>
          )}
        </div>
      </div>

      <div className={wb.split}>
        <div className={wb.left}>
          <h1 className={wb.title}>{assignment.title}</h1>
          <p className={wb.stepLine}>
            <span>
              {group.kind === "skill" ? `Step ${assignment.step} of ${group.planned} · ` : ""}
              {typeLabel(assignment)}
            </span>
            {!isRequired(assignment) && <span className={wb.extraTag}>Extra practice</span>}
          </p>
          <p className={wb.prompt}>{assignment.prompt}</p>
          {isDesktop && <DataSection dataset={dataset} label={`Data: ${dataset.title}`} />}
        </div>

        <div className={wb.right}>
          <div className={wb.editorSlot}>
            <SqlEditor
              value={sql}
              onChange={updateSql}
              onRun={runQuery}
              onCheck={checkAnswer}
              headerActions={
                <>
                  {undoSql !== null && (
                    <button
                      type="button"
                      className={`${ui.button} ${ui.quiet}`}
                      onClick={() => {
                        updateSql(undoSql);
                        setUndoSql(null);
                      }}
                    >
                      Undo reset
                    </button>
                  )}
                  <button type="button" className={`${ui.button} ${ui.quiet}`} onClick={reset} disabled={sql === starter}>
                    Reset
                  </button>
                </>
              }
            />
          </div>

          <div className={wb.actions}>
            <button type="button" className={ui.button} onClick={runQuery} disabled={isEmpty} aria-busy={running}>
              Run <span className={ui.keyHint}>{MOD_KEY}+Enter</span>
            </button>
            <button
              type="button"
              className={`${ui.button} ${showNext ? "" : ui.primary}`}
              onClick={checkAnswer}
              disabled={isEmpty}
              aria-busy={running}
            >
              Check answer <span className={ui.keyHint}>{MOD_KEY}+Shift+Enter</span>
            </button>
            {running && <span className={wb.running}>Running…</span>}
            {showNext ? (
              <span className={wb.spacerActions}>
                {extra && (
                  <a className={ui.button} href={`#/a/${extra.id}`}>
                    Extra practice
                  </a>
                )}
                <a className={`${ui.button} ${ui.primary} ${wb.nextLink}`} href={`#/a/${next.assignment.id}`}>
                  {next.label}
                </a>
              </span>
            ) : (
              !running && <span className={wb.caption}>Run previews rows. Check grades every test.</span>
            )}
          </div>

          <AssignmentTabs
            assignment={assignment}
            dataset={dataset}
            tabs={tabs}
            activeTab={activeTab}
            open={isOpen}
            collapsible={isDesktop}
            onSelect={showTab}
            onCollapse={() => setPanelOpen(false)}
            run={run && { outcome: run.outcome, stale: run.sql !== sql }}
            check={check && { outcome: check.outcome, stale: check.sql !== sql }}
          />

          <p className={ui.srOnly} role="status" aria-live="polite">
            {announcement}
          </p>
        </div>
      </div>
    </>
  );
}
