// Compiles curriculum/authoring/*.mjs into the JSON files the app and validator use.
// Expected results come from running each assignment's first solution, so the
// validator's other solutions and wrong answers are what cross-check them.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const authoringDir = join(root, "authoring");
const initSqlJs = createRequire(import.meta.url)("sql.js");
const SQL = await initSqlJs();

const skillMap = JSON.parse(readFileSync(join(root, "skill-map.json"), "utf8"));
const stageOfSkill = new Map(skillMap.stages.flatMap((stage) => stage.skills.map((skill) => [skill.id, stage.id])));
const LADDER = ["guided", "direct", "variation", "newContext", "edgeCase", "fixBug", "requirementChange", "apply", "scenario", "challenge"];
const pad = (value) => String(value).padStart(2, "0");

const { datasets: authoredDatasets } = await import(pathToFileURL(join(authoringDir, "datasets.mjs")));
for (const dataset of authoredDatasets) {
  const { alt, ...stored } = dataset;
  writeFileSync(join(root, "datasets", `${dataset.id}.json`), `${JSON.stringify(stored, null, 2)}\n`);
}

const datasets = new Map(
  readdirSync(join(root, "datasets")).map((file) => {
    const dataset = JSON.parse(readFileSync(join(root, "datasets", file), "utf8"));
    return [dataset.id, dataset];
  }),
);
const altFor = new Map(authoredDatasets.map((dataset) => [dataset.id, dataset.alt]));
altFor.set("bookshop", "DELETE FROM books; INSERT INTO books VALUES (10, 'Copper Moon', 'Ada Hill', 'Fantasy', 20.0, 100, 2020), (11, 'North Light', 'Raj Dev', 'Travel', 7.5, 180, 2015), (12, 'Sky Atlas', 'Ada Hill', 'Science', 25.0, 300, 2023);");

function regexp(pattern, value) {
  return value !== null && new RegExp(pattern).test(String(value)) ? 1 : 0;
}

function resultOf(dataset, setupSql, sql, checkSql) {
  const db = new SQL.Database();
  db.create_function("regexp", regexp);
  try {
    db.run(dataset.schemaSql);
    db.run(dataset.seedSql);
    if (setupSql) db.run(setupSql);
    let last = null;
    const run = (text) => {
      for (const stmt of db.iterateStatements(text)) {
        const columns = stmt.getColumnNames();
        const rows = [];
        while (stmt.step()) rows.push(stmt.get());
        if (columns.length > 0) last = { columns, rows };
      }
    };
    run(sql);
    if (checkSql) run(checkSql);
    return last;
  } finally {
    db.close();
  }
}

function hasTopLevelOrderBy(sql) {
  let text = sql;
  let previous;
  do {
    previous = text;
    text = text.replace(/\([^()]*\)/g, "");
  } while (text !== previous);
  return /\bORDER\s+BY\b/i.test(text);
}

function compile({ id, dataset: datasetId, title, prompt, hint, solution, wrong, opts = {} }) {
  const match = id.match(/^s(\d+)-(\d+)$/) ?? id.match(/^st(\d+)-([rc])(\d+)(?::(\d+))?$/);
  if (!match) throw new Error(`Bad id ${id}`);
  const dataset = datasets.get(datasetId);
  if (!dataset) throw new Error(`${id}: unknown dataset ${datasetId}`);
  const solutions = Array.isArray(solution) ? solution : [solution];
  const check = {
    mode: opts.check ? "table" : "result",
    ...(opts.check ? { sql: opts.check } : {}),
    ordered: opts.ordered ?? (opts.check ? true : hasTopLevelOrderBy(solutions[0])),
    columnNames: opts.columnNames ?? true,
    ...(opts.decimals !== undefined ? { decimals: opts.decimals } : {}),
  };
  // An alt starting with "+" adds to the dataset's standard hidden data.
  const altSql = opts.alt?.startsWith("+") ? `${altFor.get(datasetId)} ${opts.alt.slice(1).trim()}` : (opts.alt ?? altFor.get(datasetId));
  const expect = (setup) => {
    try {
      const result = resultOf(dataset, setup, solutions[0], check.sql);
      if (!result) throw new Error("no result set");
      return result;
    } catch (err) {
      throw new Error(`${id}: first solution failed: ${err.message}\n${solutions[0]}`);
    }
  };
  const base = {
    recalls: opts.recalls ?? [],
    title,
    prompt,
    dataset: datasetId,
    ...(opts.starter ? { starterSql: opts.starter } : {}),
    hints: Array.isArray(hint) ? hint : [hint],
    check,
    cases: [
      { name: dataset.title, hidden: false, expected: expect(undefined) },
      { name: opts.altName ?? "Different data", hidden: true, setupSql: altSql, expected: expect(altSql) },
    ],
    solutions,
    wrongSolutions: wrong.map(([sql, why]) => ({ sql, why })),
  };

  if (id.startsWith("st")) {
    const canonical = `st${match[1]}-${match[2]}${match[3]}`;
    return {
      file: `stage-${match[1]}/${match[2] === "r" ? "review" : "checkpoint"}.json`,
      entry: {
        id: canonical,
        kind: match[2] === "r" ? "review" : "checkpoint",
        stage: Number(match[1]),
        skills: opts.skills,
        ...(match[4] ? { sourceProblem: Number(match[4]) } : {}),
        ...base,
      },
    };
  }

  const skill = Number(match[1]);
  const step = Number(match[2]);
  return {
    file: `stage-${pad(stageOfSkill.get(skill))}/skill-${pad(skill)}.json`,
    entry: { id, skill, step, stepType: LADDER[step - 1], required: step <= 5, ...base },
  };
}

const lessonsDir = join(root, "lessons");
mkdirSync(lessonsDir, { recursive: true });
const byFile = new Map();
let assignmentCount = 0;
let lessonCount = 0;

for (const file of readdirSync(authoringDir).filter((name) => /^chapter-\d+\.mjs$/.test(name)).sort()) {
  const { assignments = [], lessons = [] } = await import(pathToFileURL(join(authoringDir, file)));
  for (const authored of assignments) {
    const { file: target, entry } = compile(authored);
    if (!byFile.has(target)) byFile.set(target, new Map());
    byFile.get(target).set(entry.id, entry);
    assignmentCount++;
  }
  for (const lesson of lessons) {
    writeFileSync(join(lessonsDir, `skill-${pad(lesson.skill)}.json`), `${JSON.stringify(lesson, null, 2)}\n`);
    lessonCount++;
  }
}

for (const [target, entries] of byFile) {
  const path = join(root, "assignments", target);
  mkdirSync(dirname(path), { recursive: true });
  // Hand-written entries in the same file are kept unless re-authored.
  const existing = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : [];
  const merged = new Map(existing.map((entry) => [entry.id, entry]));
  for (const [id, entry] of entries) merged.set(id, entry);
  const sorted = [...merged.values()].sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(path, `${JSON.stringify(sorted, null, 2)}\n`);
}

console.log(`Compiled ${assignmentCount} assignments and ${lessonCount} lessons.`);
