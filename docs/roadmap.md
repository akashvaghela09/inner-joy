# Roadmap

We finish and verify the curriculum first, then build the application around it.

| # | Milestone | Status | Depends on |
|---:|---|---|---|
| 0 | Feasibility prototype | Done | - |
| 1 | Curriculum foundations | In progress | 0 |
| 2 | Stage 2 content | Next | 1 |
| 3 | Complete curriculum | Planned | 2 |
| 4 | UX and visual design | Planned | 3 |
| 5 | Application foundation and engine | Planned | 3 |
| 6 | UI components and styling | Planned | 4, 5 |
| 7 | Learning experience | Planned | 6 |
| 8 | Manual review | Planned | 7 |
| 9 | Documentation | Planned | 7 |
| 10 | Launch | Planned | 8, 9 |

## Curriculum

### Milestone 0: Feasibility prototype (done)

- [x] Run SQLite in the browser through a Web Worker
- [x] Add a query playground
- [x] Grade one problem with visible and hidden tests
- [x] Publish the repository

### Milestone 1: Curriculum foundations

- [x] Assess the SQL 50
- [x] Write the curriculum plan
- [x] Create the skill map for all 55 skills
- [x] Define the assignment and dataset format
- [x] Build the automated curriculum validator
- [x] Write skill 5 as the format pilot

**Done when:** the format and validator handle a complete skill.

### Milestone 2: Stage 2 content

- [ ] Write skills 6-11, the remaining Stage 2 skills
- [ ] Add 10 stage reviews
- [ ] Add 4 original checkpoints
- [ ] Trial a sample with peers using a generated Markdown pack and the current prototype
- [ ] Revise the ladder and format based on their feedback

**Done when:** all 70 assignments pass validation and the peer trial's issues are resolved.

### Milestone 3: Complete curriculum

- [ ] Stage 1: Database basics (28)
- [ ] Stage 3: Transforming values (64)
- [ ] Stage 4: Summarising data (64)
- [ ] Stage 5: Combining tables (100)
- [ ] Stage 6: Multi-step queries (85)
- [ ] Stage 7: Window functions (54)
- [ ] Stage 8: Advanced text (23)
- [ ] Stage 9: Changing data (41)
- [ ] Stage 10: Design and performance (46)
- [ ] Write a lesson for each skill
- [ ] Write a dialect guide covering SQLite, MySQL, and PostgreSQL

**Done when:** all 575 assignments pass validation, each skill's recall plan is met, and all lessons are reviewed.

## Application

### Milestone 4: UX and visual design

- [ ] Define the learner journey from first visit to final checkpoint
- [ ] Wireframe the home, curriculum map, lesson, assignment, result, and progress screens
- [ ] Define the visual identity: colours, type, spacing, icons, and tone
- [ ] Design light and dark themes
- [ ] Design phone, tablet, and desktop layouts

**Done when:** every core screen has an approved design for each screen size and theme.

### Milestone 5: Application foundation and engine

- [ ] Restructure the prototype around the curriculum data
- [ ] Remove the prototype's grader test (`src/grader.test.ts`)
- [ ] Generate the content bundle and remove solutions from it
- [ ] Add routing using hash URLs, which work on GitHub Pages
- [ ] Support multi-table datasets and all comparison options
- [ ] Add query timeouts by stopping and restarting the worker
- [ ] Add row limits for oversized results
- [ ] Save progress in IndexedDB, with JSON export and import
- [ ] Fix the known `Rows changed` count after a rollback

**Done when:** spot-checked assignments grade correctly in the browser, and an endless query can't hang the app.

### Milestone 6: UI components and styling

**Styling approach:** CSS Modules with design tokens as CSS variables. This adds no runtime cost and makes theming straightforward.

| Group | Components |
|---|---|
| Foundation | Buttons, links, inputs, tabs, tooltips, dialogs, and icons |
| Layout | App shell, navigation, split panes, and page headers |
| Curriculum | Stage map, skill cards, progress bars, and status badges |
| Assignment | Prompt, schema viewer, SQL editor, and hint panel |
| Results | Result table, test list, expected-versus-actual view, and error message |
| Feedback | Loading, empty, success, and failure states |

**Decision to revisit:** keep the text area, or add CodeMirror for highlighting, line numbers, and Tab support.

**Done when:** every component works by keyboard and in both themes, and every state is covered.

### Milestone 7: Learning experience

- [ ] Home page and curriculum map
- [ ] Lessons and worked examples
- [ ] Assignment flow with hints and test results
- [ ] Solutions that unlock after attempts
- [ ] Links back to lessons after recall failures
- [ ] Stage reviews and checkpoints
- [ ] Stage unlocking, with a way to skip ahead for experienced learners
- [ ] Playground with all datasets

**Done when:** a learner can go from the first lesson to the final checkpoint with progress saved.

### Milestone 8: Manual review

The application has no automated test suite, which saves effort. Automated checks apply only to curriculum content, through each assignment's test cases and `npm test`.

- [ ] Walk through the core learner journeys by hand
- [ ] Spot-check assignments from every stage in the browser
- [ ] Check keyboard use and colour contrast
- [ ] Check phone, tablet, and desktop layouts
- [ ] Check saving, exporting, and importing progress

**Done when:** the walkthrough finds no critical usability or data-loss issues.

### Milestone 9: Documentation

- [ ] README with setup and project overview
- [ ] Learner guide and FAQ
- [ ] Contributor guide for writing assignments
- [ ] Architecture overview
- [ ] Licence and content attribution policy

**Done when:** a new contributor can add a validated assignment by following the guide.

### Milestone 10: Launch

- [ ] Add offline support with a PWA
- [ ] Deploy to GitHub Pages through GitHub Actions
- [ ] Run a closed beta with peers
- [ ] Fix beta issues and check that saved progress survives updates
- [ ] Release version 1.0

**Done when:** the app is public, works offline, and has a clear way to report issues.

## Risks

| Risk | Mitigation |
|---|---|
| Content is written without learner feedback | Trial Stage 2 with peers in Milestone 2 |
| Quality drops or assignments feel repetitive | Automated validation, shared datasets, and batch review |
| Curriculum changes break saved progress | Stable assignment IDs and versioned progress data |
| Learners give up on a long path | Required steps only, plus a way to skip ahead |
| Learners confuse SQL dialects | Early dialect guidance and clear error hints |
