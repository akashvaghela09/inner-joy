import type { Assignment } from "../../curriculum/tools/grade";
import { typeLabel, type Group } from "../curriculum";
import { useProgress } from "../storage";
import wb from "../workbench.module.css";

export function StepStrip({ group, current }: { group: Group; current: Assignment }) {
  const { completed, attempts } = useProgress();

  return (
    <nav aria-label={`Steps in ${group.title}`} className={wb.strip}>
      {Array.from({ length: group.planned }, (_, index) => {
        const position = index + 1;
        const assignment = group.slots.find((slot) => slot.position === position)?.assignment;
        const divider = group.kind === "skill" && position === group.requiredPlanned + 1 && (
          <span className={wb.stripDivider} aria-hidden="true" />
        );

        if (!assignment) {
          return (
            <span key={position} style={{ display: "contents" }}>
              {divider}
              <span className={`${wb.stepCell} ${wb.stepUnwritten}`} role="img" aria-label={`Step ${position}: not written yet`}>
                {position}
              </span>
            </span>
          );
        }

        const isCurrent = assignment.id === current.id;
        const done = completed.has(assignment.id);
        const attempted = (attempts[assignment.id]?.failedQueries.length ?? 0) > 0;
        const status = done ? "completed" : attempted ? "attempted" : "not started";
        const label = `Step ${position}, ${typeLabel(assignment)}: ${assignment.title}, ${status}`;

        return (
          <span key={position} style={{ display: "contents" }}>
            {divider}
            <a
              className={`${wb.stepCell} ${done ? wb.stepDone : attempted ? wb.stepAttempted : ""} ${isCurrent ? wb.stepCurrent : ""}`}
              href={`#/a/${assignment.id}`}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={label}
              title={label}
            >
              {done ? "✓" : position}
            </a>
          </span>
        );
      })}
    </nav>
  );
}
