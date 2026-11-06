# Curriculum Plan

Inner Joy teaches SQL through small drills, spaced recall, and checkpoints. Learners build comfort with one skill at a time, then keep using it so it isn't forgotten.

The plan covers 55 skills across 10 stages, with 575 assignments. The machine-readable version is [`curriculum/skill-map.json`](../curriculum/skill-map.json).

## Assignment types

| Type | Purpose | Amount |
|---|---|---|
| Skill assignment | Build comfort with one skill, from guided to independent | 5-10 per skill |
| Natural recall | Reuse an earlier skill inside a new assignment | Built into later assignments |
| Stage review | Mix a stage's skills without saying which one to use | 5-15 per stage |
| Checkpoint | Verify a stage's skills with a harder problem | 1-14 per stage |

## Skill ladder

Most skills use 8 steps. Steps 1-5 are required, and later steps are extra practice.

| Step | Type | What the learner does |
|---:|---|---|
| 1 | Guided | Completes a mostly written query |
| 2 | Direct | Writes the query from a clear instruction |
| 3 | Variation | Solves the same idea in a different form |
| 4 | New context | Uses the skill on an unfamiliar table |
| 5 | Edge case | Handles NULLs, zeros, ties, or empty results |
| 6 | Fix the bug | Repairs a query that gives the wrong result |
| 7 | Requirement change | Applies the skill to a less obvious request |
| 8 | Apply | Solves a realistic task, using an earlier skill if it fits |

Stage 1 uses 5 steps, Stage 10 uses 6, and Stage 7 uses 10. Stage 7's extra two steps add practice on realistic analysis tasks.

## Recall rules

- **Keep the focus:** each assignment has one main skill and recalls at most two earlier ones.
- **Never force it:** a skill returns only where the scenario naturally needs it.
- **Space it out:** a skill returns soon after it's learned, then at growing gaps.
- **Check coverage:** assignments are tagged, so tests can verify the planned recall.
- **Support weak spots:** if a learner fails on a recalled skill, the app links back to its lesson.

For example, arithmetic (skill 12) returns in `ROUND` (13), dates (16), `GROUP BY` (20), conditional aggregation (22), `INNER JOIN` (25), scalar subqueries (33), and window frames (43).

## Stages

Learners see stages as **chapters** in the app. The curriculum data keeps the name stage.

| Stage | Topic | Skills | Per skill | Skill assignments | Review | Checkpoints | Total |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | Database basics | 4 | 5 | 20 | 5 | 3 | 28 |
| 2 | Reading and filtering | 7 | 8 | 56 | 10 | 4 | 70 |
| 3 | Transforming values | 6 | 8 | 48 | 10 | 6 | 64 |
| 4 | Summarising data | 6 | 8 | 48 | 10 | 6 | 64 |
| 5 | Combining tables | 9 | 8 | 72 | 15 | 13 | 100 |
| 6 | Multi-step queries | 7 | 8 | 56 | 15 | 14 | 85 |
| 7 | Window functions | 4 | 10 | 40 | 10 | 4 | 54 |
| 8 | Advanced text | 2 | 8 | 16 | 5 | 2 | 23 |
| 9 | Changing data | 4 | 8 | 32 | 5 | 4 | 41 |
| 10 | Design and performance | 6 | 6 | 36 | 5 | 5 | 46 |
| | **Total** | **55** | | **424** | **90** | **61** | **575** |

The 61 checkpoints are our own versions of the 50 concepts in the [SQL 50 assessment](sql-50-assessment.md), plus 11 new ones: 3 in Stage 1, 3 in Stage 9, and 5 in Stage 10. They use original wording and data.

## Writing order

Stage 2 comes first because it proves the format on real SQL. Stage 1 follows, because it's mostly concepts, and the remaining stages then run in order.

See [the curriculum format](curriculum-format.md) for how assignments are written and validated, and [the roadmap](roadmap.md) for the full delivery plan.
