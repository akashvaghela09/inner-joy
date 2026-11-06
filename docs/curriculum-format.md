# Curriculum Format

All curriculum content lives in `curriculum/` as JSON, so it can be validated automatically and loaded by the app later.

```text
curriculum/
├── skill-map.json              # stages, skills, prerequisites, recall plan, checkpoints
├── datasets/<id>.json          # shared tables and sample rows
├── assignments/
│   └── stage-02/
│       ├── skill-05.json       # one file per skill
│       ├── review.json         # stage reviews
│       └── checkpoint.json     # stage checkpoints
├── tools/grade.ts              # runs SQL and compares results
└── curriculum.test.ts          # validates everything above
```

Run `npm test` to validate the curriculum.

## Dataset

| Field | Meaning |
|---|---|
| `id` | Matches the filename |
| `title`, `story` | Short description shown to the learner |
| `schemaSql` | Creates the tables |
| `seedSql` | Inserts the sample rows |

## Assignment

| Field | Meaning |
|---|---|
| `id` | `s<skill>-<step>`, such as `s05-03` |
| `skill`, `step` | Skill number and ladder step |
| `stepType` | `guided`, `direct`, `variation`, `newContext`, `edgeCase`, `fixBug`, `requirementChange`, or `apply` |
| `required` | True for steps 1-5 |
| `recalls` | Up to two earlier skills, all planned in the skill map |
| `title`, `prompt` | Original text shown to the learner |
| `dataset` | Dataset ID |
| `starterSql` | Optional starting query. Required for `guided` and `fixBug`, and it must fail until fixed |
| `hints` | At least one hint, from gentle to specific |
| `check` | How results are compared |
| `cases` | Visible and hidden test cases |
| `solutions` | Correct queries, which must pass every case |
| `wrongSolutions` | Common mistakes and why they're wrong. Each must fail at least one case |

### Reviews and checkpoints

These use the same fields, with a few differences:

| Field | Meaning |
|---|---|
| `id` | `st<stage>-r<number>` for reviews and `st<stage>-c<number>` for checkpoints, such as `st02-c01` |
| `kind` | `review` or `checkpoint` |
| `stage` | The stage it belongs to, replacing `skill` and `step` |
| `skills` | The skills it tests |
| `sourceProblem` | For checkpoints only: the concept's number in the [SQL 50 assessment](sql-50-assessment.md) |

## Comparison options

| Field | Meaning |
|---|---|
| `mode` | `result` compares the last result returned. `table` runs `sql` afterwards and compares that, for assignments that change data |
| `ordered` | Whether row order matters |
| `columnNames` | Whether column names must match exactly |
| `decimals` | Optional. Rounds numbers to this many places before comparing |

## Test case

| Field | Meaning |
|---|---|
| `name` | Short name shown to the learner |
| `hidden` | Hidden cases show only the name and result |
| `setupSql` | Optional SQL that changes the dataset for this case |
| `expected` | `columns` and `rows`, written by hand so they independently check the solutions |

## Automatic checks

`npm test` fails if any of these are broken:

- The skill map's numbers and checkpoint coverage don't match the plan.
- A prerequisite or recall points to a later skill.
- An assignment's fields, ID, step type, dataset, or recall plan are invalid.
- A correct solution fails a case, or a wrong solution passes every case.
- A starter query for a guided or fix-the-bug assignment already works.
- An assignment lacks a visible case or a hidden case.
- A query that hard-codes the visible answer can pass.
