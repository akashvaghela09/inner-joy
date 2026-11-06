import skillMap from "../curriculum/skill-map.json";
import type { Assignment, Dataset } from "../curriculum/tools/grade";

const datasetModules = import.meta.glob<{ default: Dataset }>("../curriculum/datasets/*.json", { eager: true });
const assignmentModules = import.meta.glob<{ default: Assignment[] }>("../curriculum/assignments/**/*.json", {
  eager: true,
});

const datasets = new Map(Object.values(datasetModules).map(({ default: dataset }) => [dataset.id, dataset]));
const allAssignments = Object.values(assignmentModules).flatMap(({ default: list }) => list);

export type NavGroup = { id: string; title: string; assignments: Assignment[] };
export type NavStage = { id: number; title: string; groups: NavGroup[] };

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

const skillTitles = new Map(skillMap.stages.flatMap((stage) => stage.skills.map((skill) => [skill.id, skill.title])));

/** Stages in learning order, including only those with written assignments. */
export const navigation: NavStage[] = skillMap.stages
  .map((stage) => {
    const skillGroups = stage.skills.map((skill) => ({
      id: `skill-${skill.id}`,
      title: skill.title,
      assignments: allAssignments
        .filter((assignment) => assignment.skill === skill.id)
        .sort((a, b) => a.step! - b.step!),
    }));
    const special = (kind: Assignment["kind"], id: string, title: string) => ({
      id: `${id}-${stage.id}`,
      title,
      assignments: allAssignments
        .filter((assignment) => assignment.kind === kind && assignment.stage === stage.id)
        .sort((a, b) => a.id.localeCompare(b.id)),
    });
    const groups = [
      ...skillGroups,
      special("review", "review", "Stage review"),
      special("checkpoint", "checkpoint", "Checkpoint"),
    ].filter((group) => group.assignments.length > 0);
    return { id: stage.id, title: stage.title, groups };
  })
  .filter((stage) => stage.groups.length > 0);

export const orderedAssignments: Assignment[] = navigation.flatMap((stage) =>
  stage.groups.flatMap((group) => group.assignments),
);

export function findAssignment(id: string | undefined): Assignment | undefined {
  return orderedAssignments.find((assignment) => assignment.id === id);
}

export function nextAssignment(id: string): Assignment | undefined {
  return orderedAssignments[orderedAssignments.findIndex((assignment) => assignment.id === id) + 1];
}

export function datasetFor(assignment: Assignment): Dataset {
  const dataset = datasets.get(assignment.dataset);
  if (!dataset) throw new Error(`Unknown dataset: ${assignment.dataset}`);
  return dataset;
}

export function skillTitle(id: number): string {
  return skillTitles.get(id) ?? `Skill ${id}`;
}

export function describeAssignment(assignment: Assignment): { eyebrow: string; badge?: string } {
  const stage = skillMap.stages.find(
    (candidate) =>
      candidate.id === assignment.stage || candidate.skills.some((skill) => skill.id === assignment.skill),
  );
  const stageLabel = `Stage ${stage?.id}`;
  if (assignment.kind === "review") return { eyebrow: `${stageLabel} · Stage review` };
  if (assignment.kind === "checkpoint") return { eyebrow: `${stageLabel} · Checkpoint` };

  const total = stage?.assignmentsPerSkill;
  const stepLabel = STEP_LABELS[assignment.stepType!] ?? assignment.stepType;
  return {
    eyebrow: `${stageLabel} · ${skillTitle(assignment.skill!)} · Step ${assignment.step} of ${total}: ${stepLabel}`,
    badge: assignment.required ? undefined : "Extra practice",
  };
}
