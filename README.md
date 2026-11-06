# Inner Joy

Learn SQL by writing it. Inner Joy is a free practice platform with short lessons and hands-on assignments that run in your browser, with nothing to install and no account needed.

**Live site: [inner-joy.app3.in](https://inner-joy.app3.in)**

## Features

- **Real SQL in the browser:** queries run on SQLite through WebAssembly, so there's no server or database to set up.
- **A guided path:** 10 chapters, 55 skills, 55 lessons, and 575 assignments that build on each other.
- **Practice that sticks:** each skill moves from guided steps to independent work, then comes back in later assignments so it isn't forgotten.
- **Instant feedback:** every answer runs against visible and hidden test cases, and failed visible tests show expected and actual results side by side.
- **Help when you're stuck:** assignments include hints, and an answer that unlocks after a pass or a few genuine attempts.
- **Saved progress:** progress and drafts stay in your browser, with no sign-up.
- **Outside practice:** most chapters link to related problems on LeetCode, so you can test your skills elsewhere whenever you're ready.
- **A free playground:** try any query against sample data, with nothing graded.
- **Light and dark themes:** the app follows your device's setting and works at phone width.

## Curriculum

| Chapter | Topic | Skills | Assignments |
|---:|---|---:|---:|
| 1 | Database basics | 4 | 28 |
| 2 | Reading and filtering | 7 | 70 |
| 3 | Transforming values | 6 | 64 |
| 4 | Summarising data | 6 | 64 |
| 5 | Combining tables | 9 | 100 |
| 6 | Multi-step queries | 7 | 85 |
| 7 | Window functions | 4 | 54 |
| 8 | Advanced text | 2 | 23 |
| 9 | Changing data | 4 | 41 |
| 10 | Design and performance | 6 | 46 |
| | **Total** | **55** | **575** |

Each skill starts with a lesson and a live worked example. Its first five steps are required, and any after that are extra practice. Each chapter also has reviews and checkpoints that mix its skills.

The content is a first draft: it passes automated validation but hasn't yet had a full review or a trial with learners.

Assignments use SQLite, so some syntax differs from MySQL or PostgreSQL. For example, `5 / 2` returns `2`, and dates use `strftime` rather than `YEAR()` or `DATE_FORMAT()`.

## Getting started

You'll need [Node.js](https://nodejs.org). The project is developed on version 24.

```bash
git clone https://github.com/akashvaghela09/inner-joy.git
cd inner-joy
npm install
npm run dev
```

Then open the URL Vite prints, normally http://localhost:5173.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Type-checks the code and builds the site into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run curriculum` | Regenerates the curriculum JSON from the authoring files |
| `npm test` | Validates all curriculum content |

## Built with

- [React](https://react.dev) and [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for development and builds
- [sql.js](https://sql.js.org) for SQLite in the browser, running in a Web Worker
- [CSS Modules](https://github.com/css-modules/css-modules) with CSS variables for theming
- [Vitest](https://vitest.dev) for curriculum validation

## Project structure

```text
inner-joy/
├── curriculum/
│   ├── authoring/              # Source of truth for assignments, lessons, and datasets
│   ├── assignments/            # Generated assignments
│   ├── lessons/                # Generated lessons
│   ├── datasets/               # Sample tables and rows
│   ├── skill-map.json          # Chapters, skills, prerequisites, recalls, and checkpoints
│   ├── external-practice.json  # Links to outside problems
│   ├── tools/                  # Curriculum build script and grader
│   └── curriculum.test.ts      # Curriculum validation
├── docs/                       # Plans and reference documents
└── src/
    ├── components/             # Screens and interface components
    ├── db.worker.ts            # Runs SQL off the main thread
    ├── curriculum.ts           # Loads curriculum data for the app
    ├── progress.ts             # Progress calculations
    ├── routes.ts               # URL paths and navigation
    └── storage.ts              # Saved progress in the browser
```

Chapters are called stages in the curriculum data and documents.

## Adding or changing assignments

1. Edit the relevant file in `curriculum/authoring/`.
2. Run `npm run curriculum` to regenerate the JSON.
3. Run `npm test` to validate it.

Validation fails if a correct solution doesn't pass, a listed wrong answer isn't caught, a copy of the visible answer passes, or planned content is missing. See the [curriculum format](docs/curriculum-format.md) for details.

Assignments must use original wording and data. Don't copy problem text from other platforms.

## Deployment

Inner Joy is a static site, so `npm run build` produces everything needed in `dist/`. It also creates `404.html`, which lets direct links such as `/chapter/2` load on static hosts.

The default build expects to live at the root of a domain. To host it in a subfolder, set the base path:

```bash
BASE_PATH=/inner-joy/ npm run build
```

## Documentation

- [Curriculum plan](docs/curriculum-plan.md): how the learning path is designed
- [Curriculum format](docs/curriculum-format.md): how assignments are written and validated
- [Roadmap](docs/roadmap.md): milestones and current status
- [SQL 50 assessment](docs/sql-50-assessment.md): the analysis behind the curriculum

## Acknowledgements

The curriculum's coverage was informed by an analysis of [LeetCode's SQL 50](https://leetcode.com/studyplan/top-sql-50/). Inner Joy isn't affiliated with or endorsed by LeetCode, and its assignments use original wording and data.
