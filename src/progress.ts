import type { Assignment } from "../curriculum/tools/grade";
import { isRequired, orderedAssignments, stages, type Group, type Stage } from "./curriculum";

export type Progress = { done: number; available: number; total: number };

function countRequired(assignments: Assignment[], completed: ReadonlySet<string>): Pick<Progress, "done" | "available"> {
  const required = assignments.filter(isRequired);
  return { available: required.length, done: required.filter(({ id }) => completed.has(id)).length };
}

const groupAssignments = (group: Group) => group.slots.map((slot) => slot.assignment);

export function groupProgress(group: Group, completed: ReadonlySet<string>): Progress {
  return { ...countRequired(groupAssignments(group), completed), total: group.requiredPlanned };
}

export function stageProgress(stage: Stage, completed: ReadonlySet<string>): Progress {
  return { ...countRequired(stage.groups.flatMap(groupAssignments), completed), total: stage.requiredPlanned };
}

/** Totals use the planned curriculum, so the numbers never fall as content ships. */
export function overallProgress(completed: ReadonlySet<string>): Progress {
  return {
    ...countRequired(orderedAssignments, completed),
    total: stages.reduce((sum, stage) => sum + stage.requiredPlanned, 0),
  };
}

export function extraDone(completed: ReadonlySet<string>): number {
  return orderedAssignments.filter((assignment) => !isRequired(assignment) && completed.has(assignment.id)).length;
}

export function firstIncompleteRequired(completed: ReadonlySet<string>): Assignment | undefined {
  return orderedAssignments.find((assignment) => isRequired(assignment) && !completed.has(assignment.id));
}

export function firstIncompleteExtra(completed: ReadonlySet<string>): Assignment | undefined {
  return orderedAssignments.find((assignment) => !isRequired(assignment) && !completed.has(assignment.id));
}
