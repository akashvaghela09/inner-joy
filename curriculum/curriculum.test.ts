import { beforeAll, describe, expect, it } from "vitest";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import skillMap from "./skill-map.json";
import { passesAllCases, runCase, type Assignment, type Dataset, type Value } from "./tools/grade";

const datasetModules = import.meta.glob<{ default: Dataset }>("./datasets/*.json", { eager: true });
const assignmentModules = import.meta.glob<{ default: Assignment[] }>("./assignments/**/*.json", { eager: true });

const datasets = new Map(Object.values(datasetModules).map((module) => [module.default.id, module.default]));
const assignments = Object.values(assignmentModules).flatMap((module) => module.default);

const { stages } = skillMap;
const skills = stages.flatMap((stage) => stage.skills);
const skillById = new Map(skills.map((skill) => [skill.id, skill]));
const stageOfSkill = new Map(stages.flatMap((stage) => stage.skills.map((skill) => [skill.id, stage] as const)));

const LADDER = ["guided", "direct", "variation", "newContext", "edgeCase", "fixBug", "requirementChange", "apply"];
const MUST_START_BROKEN = ["guided", "fixBug"];

let SQL: SqlJsStatic;
beforeAll(async () => {
  SQL = await initSqlJs();
});

function literal(value: Value): string {
  if (value === null) return "NULL";
  return typeof value === "number" ? String(value) : `'${value.replace(/'/g, "''")}'`;
}

/** Builds a query that returns the visible answer without reading any table. */
function hardCodedQuery(columns: string[], rows: Value[][]): string {
  return rows
    .map((row) => `SELECT ${row.map((value, index) => `${literal(value)} AS "${columns[index]}"`).join(", ")}`)
    .join(" UNION ALL ");
}

describe("skill map", () => {
  it("numbers the 55 skills in order", () => {
    expect(skills.map((skill) => skill.id)).toEqual(Array.from({ length: 55 }, (_, index) => index + 1));
  });

  it("matches the planned assignment totals", () => {
    const totals = stages.map(
      (stage) =>
        stage.skills.length * stage.assignmentsPerSkill +
        stage.reviewCount +
        stage.checkpoints.sourceProblems.length +
        stage.checkpoints.originalCount,
    );
    expect(totals).toEqual([28, 70, 64, 64, 100, 85, 54, 23, 41, 46]);
    expect(totals.reduce((sum, total) => sum + total, 0)).toBe(575);
  });

  it("uses each of the 50 source problems as exactly one checkpoint", () => {
    const sources = stages.flatMap((stage) => stage.checkpoints.sourceProblems).sort((a, b) => a - b);
    expect(sources).toEqual(Array.from({ length: 50 }, (_, index) => index + 1));
  });

  it("matches the SQL 50 status totals", () => {
    const count = (status: string) => skills.filter((skill) => skill.statusInSql50 === status).length;
    expect([count("missing"), count("assumed"), count("practised")]).toEqual([13, 18, 24]);
  });

  it("only depends on earlier skills", () => {
    for (const skill of skills) {
      for (const id of [...skill.prerequisites, ...skill.recalls]) {
        expect(id, `skill ${skill.id} refers to ${id}`).toBeLessThan(skill.id);
        expect(id).toBeGreaterThan(0);
      }
    }
  });

  it("plans a later recall for every skill before the optional final stage", () => {
    const recalled = new Set(skills.flatMap((skill) => skill.recalls));
    const forgotten = skills.filter((skill) => stageOfSkill.get(skill.id)!.id < 10 && !recalled.has(skill.id)).map((skill) => skill.id);
    expect(forgotten).toEqual([]);
  });
});

describe("datasets", () => {
  it.each([...datasets.values()].map((dataset) => [dataset.id, dataset] as const))("%s loads", (_id, dataset) => {
    const db = new SQL.Database();
    db.run(dataset.schemaSql);
    db.run(dataset.seedSql);
    db.close();
  });
});

describe("assignments", () => {
  it("have unique IDs", () => {
    const ids = assignments.map((assignment) => assignment.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(assignments.map((assignment) => [assignment.id, assignment] as const))("%s", (id, assignment) => {
    const dataset = () => datasets.get(assignment.dataset)!;

    it("has valid fields", () => {
      if (assignment.kind) {
        const stage = stages.find((candidate) => candidate.id === assignment.stage);
        expect(stage).toBeDefined();
        const letter = assignment.kind === "review" ? "r" : "c";
        expect(id).toMatch(new RegExp(`^st${String(assignment.stage).padStart(2, "0")}-${letter}\\d{2}$`));
        expect(assignment.skills?.length).toBeGreaterThan(0);
        for (const skillId of assignment.skills ?? []) expect(stageOfSkill.get(skillId)!.id).toBeLessThanOrEqual(stage!.id);
        if (assignment.sourceProblem !== undefined) {
          expect(assignment.kind).toBe("checkpoint");
          expect(stage!.checkpoints.sourceProblems).toContain(assignment.sourceProblem);
        }
      } else {
        const skill = skillById.get(assignment.skill!);
        const step = assignment.step!;
        expect(skill).toBeDefined();
        expect(id).toBe(`s${String(assignment.skill).padStart(2, "0")}-${String(step).padStart(2, "0")}`);
        expect(assignment.stepType).toBe(LADDER[step - 1]);
        expect(assignment.required).toBe(step <= 5);
        expect(step).toBeLessThanOrEqual(stageOfSkill.get(assignment.skill!)!.assignmentsPerSkill);
      }
      expect(datasets.has(assignment.dataset)).toBe(true);
      expect(assignment.title).not.toBe("");
      expect(assignment.prompt).not.toBe("");
      expect(assignment.hints.length).toBeGreaterThan(0);
      if (assignment.check.mode === "table") expect(assignment.check.sql).toBeTruthy();
    });

    it("recalls at most two planned skills", () => {
      expect(assignment.recalls.length).toBeLessThanOrEqual(2);
      if (assignment.kind) return;
      for (const recall of assignment.recalls) expect(skillById.get(assignment.skill!)!.recalls).toContain(recall);
    });

    it("has visible and hidden cases", () => {
      expect(assignment.cases.some((testCase) => !testCase.hidden)).toBe(true);
      expect(assignment.cases.some((testCase) => testCase.hidden)).toBe(true);
    });

    it("passes every case with each correct solution", () => {
      expect(assignment.solutions.length).toBeGreaterThan(0);
      for (const sql of assignment.solutions) {
        for (const testCase of assignment.cases) {
          const outcome = runCase(SQL, dataset(), assignment, testCase, sql);
          expect(outcome, `${sql} on "${testCase.name}"`).toMatchObject({ passed: true });
        }
      }
    });

    it("fails every wrong solution", () => {
      expect(assignment.wrongSolutions.length).toBeGreaterThanOrEqual(2);
      for (const { sql, why } of assignment.wrongSolutions) {
        expect(passesAllCases(SQL, dataset(), assignment, sql), `${sql}: ${why}`).toBe(false);
      }
    });

    it("fails an empty submission", () => {
      expect(passesAllCases(SQL, dataset(), assignment, "")).toBe(false);
    });

    it("rejects a hard-coded copy of the visible answer", () => {
      const visible = assignment.cases.find((testCase) => !testCase.hidden)!;
      if (assignment.check.mode !== "result" || visible.expected.rows.length === 0) return;
      expect(passesAllCases(SQL, dataset(), assignment, hardCodedQuery(visible.expected.columns, visible.expected.rows))).toBe(false);
    });

    it("provides a starter that needs fixing where required", () => {
      if (!MUST_START_BROKEN.includes(assignment.stepType ?? "")) return;
      expect(assignment.starterSql).toBeTruthy();
      expect(passesAllCases(SQL, dataset(), assignment, assignment.starterSql!)).toBe(false);
    });
  });
});

describe("planned recalls", () => {
  it("are all earlier than the assignment's skill", () => {
    for (const assignment of assignments) {
      if (assignment.kind) continue;
      for (const recall of assignment.recalls) expect(recall).toBeLessThan(assignment.skill!);
    }
  });
});
