import { useRef, type KeyboardEvent, type ReactNode } from "react";
import type { Assignment, Dataset } from "../../curriculum/tools/grade";
import { groupOf, skillTitle } from "../curriculum";
import { groupProgress } from "../progress";
import type { CaseReport, CheckOutcome, ErrorOutcome, RunOutcome } from "../protocol";
import { NO_ATTEMPT, recordAnswerViewed, recordHintShown, useProgress } from "../storage";
import ui from "../ui.module.css";
import wb from "../workbench.module.css";
import { DataSection } from "./DataSection";
import { ChevronUpIcon, DoneIcon, EyeOffIcon, FailedIcon, LockIcon } from "./Icons";
import { ResultTable } from "./ResultTable";
import { RunResults } from "./RunResults";

export type TabId = "data" | "results" | "tests" | "hints" | "answer";

export const PANEL_ID = "assignment-panel";

const FAILED_CHECKS_TO_UNLOCK = 2;
const FAILED_CHECKS_TO_UNLOCK_ASSESSED = 3;

type Props = {
  assignment: Assignment;
  dataset: Dataset;
  tabs: TabId[];
  activeTab: TabId;
  open: boolean;
  collapsible: boolean;
  onSelect: (tab: TabId) => void;
  onCollapse: () => void;
  run: { outcome: RunOutcome | ErrorOutcome; stale: boolean } | null;
  check: { outcome: CheckOutcome | ErrorOutcome; stale: boolean } | null;
};

const TAB_LABELS: Record<TabId, string> = {
  data: "Data",
  results: "Results",
  tests: "Tests",
  hints: "Hints",
  answer: "Answer",
};

export function failedChecksRemaining(assignment: Assignment, failedCount: number): number {
  const needed = assignment.kind ? FAILED_CHECKS_TO_UNLOCK_ASSESSED : FAILED_CHECKS_TO_UNLOCK;
  return Math.max(0, needed - failedCount);
}

export function AssignmentTabs(props: Props) {
  const { assignment, tabs, activeTab, open, collapsible, onSelect, onCollapse, check } = props;
  const { completed, attempts } = useProgress();
  const attempt = attempts[assignment.id] ?? NO_ATTEMPT;
  const passed = completed.has(assignment.id);
  const unlocked = passed || failedChecksRemaining(assignment, attempt.failedQueries.length) === 0;
  const tabRefs = useRef(new Map<TabId, HTMLButtonElement>());

  function onKeyDown(event: KeyboardEvent) {
    const index = tabs.indexOf(activeTab);
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    onSelect(tabs[target]);
    tabRefs.current.get(tabs[target])?.focus();
  }

  function badge(tab: TabId): ReactNode {
    if (tab === "tests" && check?.outcome.kind === "check") {
      const passedCount = check.outcome.cases.filter((result) => result.passed).length;
      return (
        <span className={`${wb.tabBadge} ${check.outcome.passed ? wb.badgePass : wb.badgeFail}`}>
          {passedCount}/{check.outcome.cases.length}
        </span>
      );
    }
    if (tab === "hints" && attempt.hintsShown > 0) {
      return <span className={wb.tabBadge}>{Math.min(attempt.hintsShown, assignment.hints.length)}</span>;
    }
    if (tab === "answer" && !unlocked) {
      return (
        <>
          <LockIcon />
          <span className={ui.srOnly}>locked</span>
        </>
      );
    }
    return null;
  }

  return (
    <section id={PANEL_ID} className={`${wb.panel} ${open ? wb.panelOpen : ""}`} aria-label="Assignment details">
      <div className={wb.tabBar}>
        <div className={wb.tabs} role="tablist" aria-label="Assignment details" onKeyDown={onKeyDown}>
          {tabs.map((tab) => {
            const selected = tab === activeTab;
            return (
              <button
                key={tab}
                ref={(element) => {
                  if (element) tabRefs.current.set(tab, element);
                  else tabRefs.current.delete(tab);
                }}
                id={`tab-${tab}`}
                role="tab"
                type="button"
                aria-selected={selected && open}
                aria-controls={selected && open ? "assignment-tabpanel" : undefined}
                tabIndex={selected ? 0 : -1}
                className={`${wb.tab} ${selected && open ? wb.tabActive : ""}`}
                onClick={() => (selected && open && collapsible ? onCollapse() : onSelect(tab))}
              >
                {TAB_LABELS[tab]}
                {badge(tab)}
              </button>
            );
          })}
        </div>
        {collapsible && (
          <button
            type="button"
            className={wb.collapse}
            aria-expanded={open}
            aria-label={open ? "Collapse panel" : "Expand panel"}
            onClick={() => (open ? onCollapse() : onSelect(activeTab))}
          >
            <span className={`${wb.collapseIcon} ${open ? wb.collapseIconOpen : ""}`}>
              <ChevronUpIcon />
            </span>
          </button>
        )}
      </div>
      {open && (
        <div
          id="assignment-tabpanel"
          className={wb.tabPanel}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
        >
          <TabContent {...props} unlocked={unlocked} passed={passed} />
        </div>
      )}
    </section>
  );
}

function TabContent(props: Props & { unlocked: boolean; passed: boolean }) {
  const { activeTab, assignment, dataset, run, check, unlocked, passed } = props;
  switch (activeTab) {
    case "data":
      return <DataSection dataset={dataset} label={`Data: ${dataset.title}`} />;
    case "results":
      return <ResultsTab run={run} />;
    case "tests":
      return <TestsTab assignment={assignment} check={check} />;
    case "hints":
      return <HintsTab assignment={assignment} />;
    case "answer":
      return <AnswerTab assignment={assignment} unlocked={unlocked} passed={passed} />;
  }
}

function StaleNote({ show }: { show: boolean }) {
  return show ? <p className={wb.stale}>From your previous query</p> : null;
}

function ResultsTab({ run }: { run: Props["run"] }) {
  if (!run) return <p className={wb.empty}>Run your query to see rows here.</p>;
  return (
    <>
      <StaleNote show={run.stale} />
      {run.outcome.kind === "error" ? (
        <pre role="alert" className={ui.errorBox}>
          {run.outcome.error}
        </pre>
      ) : (
        <RunResults outcome={run.outcome} />
      )}
    </>
  );
}

function TestsTab({ assignment, check }: { assignment: Assignment; check: Props["check"] }) {
  if (!check) return <TestsPreview assignment={assignment} />;
  const { outcome, stale } = check;
  if (outcome.kind === "error") {
    return (
      <pre role="alert" className={ui.errorBox}>
        {outcome.error}
      </pre>
    );
  }
  const passedCount = outcome.cases.filter((result) => result.passed).length;
  return (
    <>
      <StaleNote show={stale} />
      <p className={`${wb.verdict} ${outcome.passed ? wb.verdictPass : wb.verdictFail}`}>
        {outcome.passed ? <DoneIcon /> : <FailedIcon />}
        {outcome.passed ? "Correct" : "Not quite"}: {passedCount} of {outcome.cases.length} tests passed
      </p>
      {outcome.passed && <PassNotes assignment={assignment} />}
      <ul>
        {outcome.cases.map((result) => (
          <CaseRow key={result.name} result={result} />
        ))}
      </ul>
    </>
  );
}

function PassNotes({ assignment }: { assignment: Assignment }) {
  const { completed } = useProgress();
  const group = groupOf(assignment);
  const { done, total } = groupProgress(group, completed);
  const recalled = assignment.recalls.map(skillTitle);
  return (
    <>
      {group.kind === "skill" && done === total && <p className={wb.milestone}>{group.title}: required steps done.</p>}
      {recalled.length > 0 && <p className={wb.milestone}>This also used: {recalled.join(", ")}.</p>}
    </>
  );
}

function TestsPreview({ assignment }: { assignment: Assignment }) {
  const visible = assignment.cases.filter((testCase) => !testCase.hidden);
  const hiddenCount = assignment.cases.length - visible.length;
  return (
    <>
      {visible.map((testCase) => (
        <div key={testCase.name} className={wb.resultBlock}>
          <h3 className={wb.resultLabel}>{testCase.name}: expected result</h3>
          <ResultTable columns={testCase.expected.columns} rows={testCase.expected.rows} />
        </div>
      ))}
      {hiddenCount > 0 && (
        <p className={wb.hiddenCount}>
          <EyeOffIcon />+{hiddenCount} hidden {hiddenCount === 1 ? "test" : "tests"}
        </p>
      )}
    </>
  );
}

function CaseRow({ result }: { result: CaseReport }) {
  return (
    <li className={wb.caseRow}>
      <div className={wb.caseLine}>
        <span className={result.passed ? wb.casePass : wb.caseFail} style={{ display: "inline-flex" }}>
          {result.passed ? <DoneIcon /> : <FailedIcon />}
          <span className={ui.srOnly}>{result.passed ? "Passed" : "Failed"}</span>
        </span>
        <span>{result.name}</span>
        {result.hidden && (
          <span className={wb.caseHidden} style={{ display: "inline-flex" }} title="Hidden test">
            <EyeOffIcon />
            <span className={ui.srOnly}>Hidden test</span>
          </span>
        )}
      </div>
      {result.error && <pre className={ui.errorBox}>{result.error}</pre>}
      {!result.passed && !result.error && result.expected && result.actual && (
        <div className={wb.compare}>
          <div>
            <h4 className={wb.compareTitle}>Expected</h4>
            <ResultTable columns={result.expected.columns} rows={result.expected.rows} />
          </div>
          <div>
            <h4 className={wb.compareTitle}>Yours</h4>
            <ResultTable columns={result.actual.columns} rows={result.actual.rows} />
          </div>
        </div>
      )}
    </li>
  );
}

function HintsTab({ assignment }: { assignment: Assignment }) {
  const { attempts } = useProgress();
  const shown = Math.min((attempts[assignment.id] ?? NO_ATTEMPT).hintsShown, assignment.hints.length);
  const total = assignment.hints.length;
  const recalled = assignment.recalls.map(skillTitle);
  return (
    <>
      {shown > 0 && (
        <ol className={wb.hintList}>
          {assignment.hints.slice(0, shown).map((hint, index) => (
            <li key={hint} className={wb.hintItem}>
              <span className={wb.hintNumber}>Hint {index + 1}</span>
              {hint}
            </li>
          ))}
        </ol>
      )}
      {shown < total ? (
        <button type="button" className={ui.button} onClick={() => recordHintShown(assignment.id)}>
          Show hint {shown + 1} of {total}
        </button>
      ) : (
        <p className={wb.empty}>That's every hint for this assignment.</p>
      )}
      {shown === total && recalled.length > 0 && <p className={wb.alsoUses}>Also uses: {recalled.join(", ")}</p>}
    </>
  );
}

function AnswerTab({ assignment, unlocked, passed }: { assignment: Assignment; unlocked: boolean; passed: boolean }) {
  const { attempts } = useProgress();
  const attempt = attempts[assignment.id] ?? NO_ATTEMPT;

  if (!unlocked) {
    const remaining = failedChecksRemaining(assignment, attempt.failedQueries.length);
    return (
      <p className={wb.locked}>
        <LockIcon />
        Available after {remaining} more {remaining === 1 ? "check" : "checks"} with different SQL.
      </p>
    );
  }

  if (!attempt.answerViewed && !passed) {
    return (
      <>
        <p className={wb.answerNote}>Try once more if you can. Retyping the answer helps it stick.</p>
        <button type="button" className={ui.button} onClick={() => recordAnswerViewed(assignment.id)}>
          Show answer
        </button>
      </>
    );
  }

  const [first, ...alternatives] = assignment.solutions;
  return (
    <>
      <pre className={wb.solution}>{first}</pre>
      {!passed && <p className={wb.empty}>Type it in and check it to complete this assignment.</p>}
      {passed && alternatives.length > 0 && (
        <>
          <h3 className={wb.answerHeading}>Another way</h3>
          {alternatives.map((sql) => (
            <pre key={sql} className={wb.solution}>
              {sql}
            </pre>
          ))}
        </>
      )}
      {passed && (
        <>
          <h3 className={wb.answerHeading}>Common mistakes</h3>
          <ul>
            {assignment.wrongSolutions.map(({ why }) => (
              <li key={why} className={wb.mistake}>
                {why}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
