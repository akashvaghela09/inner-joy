import skillMap from "../curriculum/skill-map.json";
import type { Assignment, Dataset } from "../curriculum/tools/grade";

const datasetModules = import.meta.glob<{ default: Dataset }>("../curriculum/datasets/*.json", { eager: true });
const assignmentModules = import.meta.glob<{ default: Assignment[] }>("../curriculum/assignments/**/*.json", {
  eager: true,
});

const datasets = new Map(Object.values(datasetModules).map(({ default: dataset }) => [dataset.id, dataset]));
const allAssignments = Object.values(assignmentModules).flatMap(({ default: list }) => list);

const REQUIRED_STEPS = 5;

/** A skill, stage review, or set of checkpoints: one row of the curriculum. */
export type Group = {
  id: string;
  kind: "skill" | "review" | "checkpoint";
  stageId: number;
  title: string;
  outcome?: string;
  planned: number;
  requiredPlanned: number;
  /** Written assignments, each at its planned position (1-based). */
  slots: { position: number; assignment: Assignment }[];
};

export type Stage = {
  id: number;
  title: string;
  groups: Group[];
  requiredPlanned: number;
};

function specialGroup(stage: (typeof skillMap.stages)[number], kind: "review" | "checkpoint", title: string, planned: number): Group {
  const slots = allAssignments
    .filter((assignment) => assignment.kind === kind && assignment.stage === stage.id)
    .map((assignment) => ({ position: Number(assignment.id.slice(-2)), assignment }))
    .sort((a, b) => a.position - b.position);
  return { id: `${kind}-${stage.id}`, kind, stageId: stage.id, title, planned, requiredPlanned: planned, slots };
}

/** Every planned stage in learning order, including those not written yet. */
export const stages: Stage[] = skillMap.stages.map((stage) => {
  const skills: Group[] = stage.skills.map((skill) => ({
    id: `skill-${skill.id}`,
    kind: "skill",
    stageId: stage.id,
    title: skill.title,
    outcome: skill.outcome,
    planned: stage.assignmentsPerSkill,
    requiredPlanned: Math.min(REQUIRED_STEPS, stage.assignmentsPerSkill),
    slots: allAssignments
      .filter((assignment) => assignment.skill === skill.id)
      .map((assignment) => ({ position: assignment.step!, assignment }))
      .sort((a, b) => a.position - b.position),
  }));
  const groups = [
    ...skills,
    specialGroup(stage, "review", "Stage review", stage.reviewCount),
    specialGroup(stage, "checkpoint", "Checkpoints", stage.checkpoints.sourceProblems.length + stage.checkpoints.originalCount),
  ];
  return {
    id: stage.id,
    title: stage.title,
    groups,
    requiredPlanned: groups.reduce((sum, group) => sum + group.requiredPlanned, 0),
  };
});

export const orderedAssignments: Assignment[] = stages.flatMap((stage) =>
  stage.groups.flatMap((group) => group.slots.map((slot) => slot.assignment)),
);

const allGroups = stages.flatMap((stage) => stage.groups);

export function groupOf(assignment: Assignment): Group {
  const group = allGroups.find((candidate) => candidate.slots.some((slot) => slot.assignment.id === assignment.id));
  if (!group) throw new Error(`No group for ${assignment.id}`);
  return group;
}

export function isRequired(assignment: Assignment): boolean {
  return assignment.kind ? true : assignment.required === true;
}

export function findAssignment(id: string | undefined): Assignment | undefined {
  return orderedAssignments.find((assignment) => assignment.id === id);
}

function indexOf(assignment: Assignment): number {
  return orderedAssignments.findIndex((candidate) => candidate.id === assignment.id);
}

export function previousAssignment(assignment: Assignment): Assignment | undefined {
  return orderedAssignments[indexOf(assignment) - 1];
}

export function nextAssignment(assignment: Assignment): Assignment | undefined {
  return orderedAssignments[indexOf(assignment) + 1];
}

export function datasetFor(assignment: Assignment): Dataset {
  const dataset = datasets.get(assignment.dataset);
  if (!dataset) throw new Error(`Unknown dataset: ${assignment.dataset}`);
  return dataset;
}

const skillTitles = new Map(skillMap.stages.flatMap((stage) => stage.skills.map((skill) => [skill.id, skill.title])));

export function skillTitle(id: number): string {
  return skillTitles.get(id) ?? `Skill ${id}`;
}

const STEP_LABELS: Record<string, string> = {
  guided: "Guided",
  direct: "Direct",
  variation: "Variation",
  newContext: "New context",
  edgeCase: "Edge case",
  fixBug: "Fix the bug",
  requirementChange: "Requirement change",
  apply: "Apply",
};

export function typeLabel(assignment: Assignment): string {
  if (assignment.kind === "review") return "Stage review";
  if (assignment.kind === "checkpoint") return "Checkpoint";
  return STEP_LABELS[assignment.stepType!] ?? "";
}

export type NextStep = { primary?: { assignment: Assignment; label: string }; extra?: Assignment };

/** Where to go after passing: finishing step 5 offers the next skill first, with extras optional. */
export function nextSteps(assignment: Assignment): NextStep {
  const group = groupOf(assignment);
  const after = orderedAssignments.slice(indexOf(assignment) + 1);
  const label = (target: Assignment) =>
    `${groupOf(target).id !== group.id && !target.kind ? "Next skill" : "Next"}: ${target.title}`;

  if (assignment.step === REQUIRED_STEPS) {
    const outside = after.find((candidate) => groupOf(candidate).id !== group.id);
    const extra = after.find((candidate) => groupOf(candidate).id === group.id);
    if (outside) return { primary: { assignment: outside, label: label(outside) }, extra };
    if (extra) return { primary: { assignment: extra, label: `Extra practice: ${extra.title}` } };
    return {};
  }
  const next = after[0];
  return next ? { primary: { assignment: next, label: label(next) } } : {};
}
