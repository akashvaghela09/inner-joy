# SQL 50 Assessment

An analysis of LeetCode's [SQL 50 study plan](https://leetcode.com/studyplan/top-sql-50/), used as input for the Inner Joy curriculum. Statistics were collected on 2026-11-06.

This file holds factual metadata and our own analysis. It does not reproduce LeetCode's problem text, and Inner Joy problems must use original wording and data. A full local copy is kept at `docs/reference/leetcode-sql-50-source.md`, which is Git-ignored and must stay out of this public repo.

## Key findings

1. **Grouping is needed before it is taught.** 5 of the 9 Basic Joins problems (8, 10, 12, 13, 14) rely on `GROUP BY` or aggregates, which have their own section only afterwards.
2. **Window functions have no section.** Problems 33, 35, 40, and 43 suit them, but the plan never teaches them directly. Dates, NULL handling, and CTEs have no section either.
3. **Difficulty doesn't rise steadily.** Average acceptance falls to 57.4% in section 3, then rises to 65.9% in section 4. The final section returns to mostly Easy labels right after the plan's only Hard problem.
4. **Labels don't always match how hard problems prove.** The three lowest acceptance rates are all Easy problems: 50 (35.2%), 16 (38.1%), and 45 (39.6%). Medium problem 38 reaches 75.3%, and the Hard problem's 62.3% is above the Medium average of 57.5%.
5. **Some problems are in surprising sections.** Problem 15 needs no aggregate despite its section, 38 needs `CASE` rather than a subquery, and 46 and 47 sit in the strings section without using strings.
6. **The plan is almost entirely reading data.** Only problem 46 changes data, and no problem uses `INSERT`, `UPDATE`, table design, transactions, or indexes.
7. **Most traps are about logic, not syntax.** The recurring ones are NULL behaviour, lost rows from join filters, missing zero rows, duplicates, and wrong denominators.

## Plan overview

The plan has 50 free problems in 7 sections: **32 Easy, 17 Medium, and 1 Hard**. Only 5 problems include hints.

| # | Section | Problems | Easy / Medium / Hard | Avg acceptance | Avg our level |
|---|---|---:|---:|---:|---:|
| 1 | Select | 5 | 5 / 0 / 0 | 78.8% | 1.0 |
| 2 | Basic Joins | 9 | 7 / 2 / 0 | 68.1% | 2.9 |
| 3 | Basic Aggregate Functions | 8 | 5 / 3 / 0 | 57.4% | 3.0 |
| 4 | Sorting and Grouping | 7 | 5 / 2 / 0 | 65.9% | 2.6 |
| 5 | Advanced Select and Joins | 7 | 3 / 4 / 0 | 64.5% | 3.3 |
| 6 | Subqueries | 7 | 1 / 5 / 1 | 58.4% | 4.1 |
| 7 | Advanced String Functions / Regex / Clause | 7 | 6 / 1 / 0 | 57.6% | 3.0 |

## How to read the data

- **LC:** LeetCode's difficulty label: Easy, Medium, or Hard.
- **Accept:** LeetCode's acceptance rate. It's a rough signal, because it covers all attempts and languages and reflects more than problem difficulty.
- **Dislike:** dislikes as a share of all ratings. A high value often points to a confusing statement rather than a hard problem.
- **Level:** our own judgement of how much reasoning a typical solution needs:

| Level | Meaning | Problems |
|---:|---|---:|
| 1 | One clause or a simple filter | 6 |
| 2 | One main concept | 9 |
| 3 | Two concepts combined | 21 |
| 4 | Several steps, or a subtle requirement | 11 |
| 5 | Several stages combining advanced techniques | 3 |

## Problem analysis

### 1. Select

| # | Problem | LC | Accept | Dislike | Tables | Level | Solution flow | Main trap | SQLite note |
|---:|---|---|---:|---:|---:|---:|---|---|---|
| 1 | [Recyclable and Low Fat Products](https://leetcode.com/problems/recyclable-and-low-fat-products/) | E | 88.7% | 4% | 1 | 1 | Filter on two flags, return IDs | None significant | - |
| 2 | [Find Customer Referee](https://leetcode.com/problems/find-customer-referee/) | E | 73.8% | 12% | 1 | 1 | Filter with an OR that includes missing values | `<> 2` silently drops NULL rows | - |
| 3 | [Big Countries](https://leetcode.com/problems/big-countries/) | E | 69.0% | 28% | 1 | 1 | Filter with an OR across two thresholds | Thresholds are inclusive | - |
| 4 | [Article Views I](https://leetcode.com/problems/article-views-i/) | E | 77.0% | 6% | 1 | 1 | Compare two columns, remove duplicates, sort, rename | Repeat views create duplicate output | - |
| 5 | [Invalid Tweets](https://leetcode.com/problems/invalid-tweets/) | E | 85.3% | 19% | 1 | 1 | Measure text length, filter | Limit is strictly greater than | Use `LENGTH`; no `CHAR_LENGTH` |

### 2. Basic Joins

| # | Problem | LC | Accept | Dislike | Tables | Level | Solution flow | Main trap | SQLite note |
|---:|---|---|---:|---:|---:|---:|---|---|---|
| 6 | [Replace Employee ID With The Unique Identifier](https://leetcode.com/problems/replace-employee-id-with-the-unique-identifier/) | E | 84.0% | 7% | 2 | 2 | Keep every employee, attach optional ID | Inner join drops employees without an ID | - |
| 7 | [Product Sales Analysis I](https://leetcode.com/problems/product-sales-analysis-i/) | E | 86.4% | 14% | 2 | 2 | Join a lookup, select columns | None significant | - |
| 8 | [Customer Who Visited but Did Not Make Any Transactions](https://leetcode.com/problems/customer-who-visited-but-did-not-make-any-transactions/) | E | 69.0% | 11% | 2 | 3 | Find unmatched rows, then count per customer | Must count visits, not transactions | - |
| 9 | [Rising Temperature](https://leetcode.com/problems/rising-temperature/) | E | 52.5% | 14% | 1 | 3 | Pair each row with the previous calendar day | Previous row or ID is not previous day | Use `julianday()` or `date()`; no `DATEDIFF` |
| 10 | [Average Time of Process per Machine](https://leetcode.com/problems/average-time-of-process-per-machine/) | E | 67.2% | 9% | 1 | 3 | Pair start and end rows, average per machine | Average per process, not per row | - |
| 11 | [Employee Bonus](https://leetcode.com/problems/employee-bonus/) | E | 78.4% | 15% | 2 | 2 | Keep all employees, filter on optional value | `bonus < 1000` drops people with no bonus | - |
| 12 | [Students and Examinations](https://leetcode.com/problems/students-and-examinations/) | E | 62.3% | 10% | 3 | 4 | Build all combinations, attach attempts, count | Zero-attempt pairs must still appear | - |
| 13 | [Managers with at Least 5 Direct Reports](https://leetcode.com/problems/managers-with-at-least-5-direct-reports/) | M | 49.9% | 9% | 1 | 3 | Count reports per manager, then look up the manager | Manager ID may not exist as an employee | - |
| 14 | [Confirmation Rate](https://leetcode.com/problems/confirmation-rate/) | M | 63.1% | 8% | 2 | 4 | Attach outcomes, compute a per-user rate | Users with no requests must show 0 | Integer division risk |

### 3. Basic Aggregate Functions

| # | Problem | LC | Accept | Dislike | Tables | Level | Solution flow | Main trap | SQLite note |
|---:|---|---|---:|---:|---:|---:|---|---|---|
| 15 | [Not Boring Movies](https://leetcode.com/problems/not-boring-movies/) | E | 75.3% | 26% | 1 | 1 | Filter on odd ID and text, sort | None significant | Use `%`; no `MOD()` |
| 16 | [Average Selling Price](https://leetcode.com/problems/average-selling-price/) | E | 38.1% | 12% | 2 | 4 | Match sales to a price period, compute a weighted average | Date condition in `WHERE` drops unsold products | Integer division risk |
| 17 | [Project Employees I](https://leetcode.com/problems/project-employees-i/) | E | 67.7% | 16% | 2 | 2 | Join, then average per project | None significant | - |
| 18 | [Percentage of Users Attended a Contest](https://leetcode.com/problems/percentage-of-users-attended-a-contest/) | E | 61.7% | 8% | 2 | 3 | Count per contest, divide by all users | Denominator is all users; ties need a second sort | Integer division risk |
| 19 | [Queries Quality and Percentage](https://leetcode.com/problems/queries-quality-and-percentage/) | E | 55.7% | 31% | 1 | 3 | Compute a per-row ratio, average, plus a conditional percentage | Average of ratios differs from ratio of averages | Integer division risk |
| 20 | [Monthly Transactions I](https://leetcode.com/problems/monthly-transactions-i/) | M | 60.3% | 8% | 1 | 3 | Group by month and country, add conditional totals | Approved totals must be 0, not NULL | Use `strftime`; no `DATE_FORMAT` |
| 21 | [Immediate Food Delivery II](https://leetcode.com/problems/immediate-food-delivery-ii/) | M | 57.5% | 11% | 1 | 4 | Isolate each customer's first order, then a percentage | Only first orders count | Integer division risk |
| 22 | [Game Play Analysis IV](https://leetcode.com/problems/game-play-analysis-iv/) | M | 43.0% | 13% | 1 | 4 | Find first login, check the next day, compute a fraction | Any consecutive login is not enough | Integer division and date functions |

### 4. Sorting and Grouping

| # | Problem | LC | Accept | Dislike | Tables | Level | Solution flow | Main trap | SQLite note |
|---:|---|---|---:|---:|---:|---:|---|---|---|
| 23 | [Number of Unique Subjects Taught by Each Teacher](https://leetcode.com/problems/number-of-unique-subjects-taught-by-each-teacher/) | E | 89.4% | 7% | 1 | 2 | Count distinct values per group | Same subject repeats across departments | - |
| 24 | [User Activity for the Past 30 Days I](https://leetcode.com/problems/user-activity-for-the-past-30-days-i/) | E | 52.1% | 47% | 1 | 3 | Bound a date window, count distinct users per day | 30-day window is easy to get off by one | Use `date()` modifiers |
| 25 | [Product Sales Analysis III](https://leetcode.com/problems/product-sales-analysis-iii/) | M | 47.0% | 57% | 1 | 3 | Find each product's first year, return all its rows | A first year can have several rows | - |
| 26 | [Classes With at Least 5 Students](https://leetcode.com/problems/classes-with-at-least-5-students/) | E | 65.4% | 44% | 1 | 2 | Count per group, filter groups | None significant | - |
| 27 | [Find Followers Count](https://leetcode.com/problems/find-followers-count/) | E | 69.7% | 6% | 1 | 2 | Count per group, sort | None significant | - |
| 28 | [Biggest Single Number](https://leetcode.com/problems/biggest-single-number/) | E | 72.6% | 16% | 1 | 3 | Keep values seen once, take the largest | Must return NULL, not an empty result | - |
| 29 | [Customers Who Bought All Products](https://leetcode.com/problems/customers-who-bought-all-products/) | M | 64.9% | 7% | 2 | 3 | Compare a customer's distinct count to the total | Duplicate purchases inflate plain counts | - |

### 5. Advanced Select and Joins

| # | Problem | LC | Accept | Dislike | Tables | Level | Solution flow | Main trap | SQLite note |
|---:|---|---|---:|---:|---:|---:|---|---|---|
| 30 | [The Number of Employees Which Report to Each Employee](https://leetcode.com/problems/the-number-of-employees-which-report-to-each-employee/) | E | 54.3% | 11% | 1 | 3 | Join reports to managers, summarise per manager | Only people with reports count as managers | - |
| 31 | [Primary Department for Each Employee](https://leetcode.com/problems/primary-department-for-each-employee/) | E | 76.0% | 22% | 1 | 3 | Choose the flagged row or the only row | A single department is not flagged | - |
| 32 | [Triangle Judgement](https://leetcode.com/problems/triangle-judgement/) | E | 75.6% | 21% | 1 | 2 | Derive a yes or no from three inequalities | All three sides must be checked | - |
| 33 | [Consecutive Numbers](https://leetcode.com/problems/consecutive-numbers/) | M | 49.8% | 11% | 1 | 4 | Compare a row with its neighbours | Long runs produce duplicates | - |
| 34 | [Product Price at a Given Date](https://leetcode.com/problems/product-price-at-a-given-date/) | M | 59.1% | 18% | 1 | 4 | Find the latest change by a date, else a default | Products with no earlier change use the default | - |
| 35 | [Last Person to Fit in the Bus](https://leetcode.com/problems/last-person-to-fit-in-the-bus/) | M | 70.4% | 4% | 1 | 4 | Build a running total, take the last valid row | Order by turn, not by ID | - |
| 36 | [Count Salary Categories](https://leetcode.com/problems/count-salary-categories/) | M | 66.0% | 13% | 1 | 3 | Create a fixed list of categories, count into each | Empty categories must still appear | - |

### 6. Subqueries

| # | Problem | LC | Accept | Dislike | Tables | Level | Solution flow | Main trap | SQLite note |
|---:|---|---|---:|---:|---:|---:|---|---|---|
| 37 | [Employees Whose Manager Left the Company](https://leetcode.com/problems/employees-whose-manager-left-the-company/) | E | 49.2% | 8% | 1 | 3 | Find references to rows that no longer exist | NULL manager is different from a departed manager | - |
| 38 | [Exchange Seats](https://leetcode.com/problems/exchange-seats/) | M | 75.3% | 23% | 1 | 3 | Recompute each ID from odd or even position | An odd final row stays in place | Use `%`; no `MOD()` |
| 39 | [Movie Rating](https://leetcode.com/problems/movie-rating/) | M | 45.0% | 18% | 3 | 5 | Solve two separate rankings, stack the answers | Two tie-breaks and one date filter | No parenthesised `UNION` branches |
| 40 | [Restaurant Growth](https://leetcode.com/problems/restaurant-growth/) | M | 60.5% | 24% | 1 | 5 | Total per day, then a seven-day moving window | Roll up to days first; first six days have no full window | Use `ROWS` or `julianday`; no `INTERVAL` |
| 41 | [Friend Requests II: Who Has the Most Friends](https://leetcode.com/problems/friend-requests-ii-who-has-the-most-friends/) | M | 64.2% | 13% | 1 | 4 | Stack both sides of each friendship, count | Must use `UNION ALL`, not `UNION` | - |
| 42 | [Investments in 2016](https://leetcode.com/problems/investments-in-2016/) | M | 52.4% | 39% | 1 | 4 | Apply two independent group conditions, then sum | Conditions check the whole table separately | - |
| 43 | [Department Top Three Salaries](https://leetcode.com/problems/department-top-three-salaries/) | H | 62.3% | 10% | 2 | 5 | Rank distinct salaries per department, keep the top three | Tied salaries share a rank | - |

### 7. Advanced String Functions / Regex / Clause

| # | Problem | LC | Accept | Dislike | Tables | Level | Solution flow | Main trap | SQLite note |
|---:|---|---|---:|---:|---:|---:|---|---|---|
| 44 | [Fix Names in a Table](https://leetcode.com/problems/fix-names-in-a-table/) | E | 60.9% | 11% | 1 | 2 | Rebuild text from its first letter and the rest | None significant | Use `SUBSTR`; no `LEFT` |
| 45 | [Patients With a Condition](https://leetcode.com/problems/patients-with-a-condition/) | E | 39.6% | 42% | 1 | 3 | Match a code at a word start | A mid-word match is a false positive | `LIKE` ignores case; `GLOB` does not |
| 46 | [Delete Duplicate Emails](https://leetcode.com/problems/delete-duplicate-emails/) | E | 67.2% | 16% | 1 | 3 | Identify rows to keep, delete the rest | Must change the table | No MySQL `DELETE ... JOIN` form |
| 47 | [Second Highest Salary](https://leetcode.com/problems/second-highest-salary/) | M | 48.9% | 19% | 1 | 3 | Find the second distinct value, or NULL | Must return NULL; tied salaries count once | - |
| 48 | [Group Sold Products By The Date](https://leetcode.com/problems/group-sold-products-by-the-date/) | E | 78.6% | 7% | 1 | 3 | Count and join distinct names per date | Names must be deduplicated and sorted | No `SEPARATOR`; `ORDER BY` inside works |
| 49 | [List the Products Ordered in a Period](https://leetcode.com/problems/list-the-products-ordered-in-a-period/) | E | 72.5% | 7% | 2 | 3 | Filter a month, total per product, filter totals | Sum across the month, not per order | No `MONTH()` or `YEAR()` |
| 50 | [Find Users With Valid E-Mails](https://leetcode.com/problems/find-users-with-valid-e-mails/) | E | 35.2% | 29% | 1 | 4 | Validate text against a full pattern | Escape the dot, anchor both ends, exact-case domain | `REGEXP` must be registered by the app |

## Concept coverage

These counts are based on typical solutions, and many problems allow more than one approach. For example, a self join and a window function can both solve problem 33.

| Concept | Problems | Which ones |
|---|---:|---|
| Filtering with `WHERE` | 9 | 1, 2, 3, 4, 5, 11, 15, 24, 45 |
| NULL handling | 9 | 2, 6, 8, 11, 14, 16, 28, 37, 47 |
| `DISTINCT` | 7 | 4, 23, 24, 29, 33, 47, 48 |
| Sorting or `LIMIT` | 14 | 4, 12, 15, 18, 27, 30, 35, 37, 38, 39, 41, 44, 47, 48 |
| Inner join | 5 | 7, 17, 39, 43, 49 |
| Left join | 6 | 6, 8, 11, 12, 14, 16 |
| Self join | 6 | 9, 10, 13, 22, 30, 33 |
| Cross join | 1 | 12 |
| `GROUP BY` | 27 | 8, 10, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 39, 40, 41, 42, 46, 48, 49 |
| `HAVING` | 5 | 13, 26, 28, 29, 49 |
| Aggregates, beyond counting | 4 | 10, 17, 20, 30 |
| `CASE` | 7 | 14, 19, 20, 21, 32, 36, 38 |
| Ratios or percentages | 6 | 14, 16, 18, 19, 21, 22 |
| Rounding | 11 | 10, 14, 16, 17, 18, 19, 21, 22, 30, 40, 42 |
| Subqueries | 12 | 18, 21, 22, 25, 28, 29, 31, 34, 37, 42, 46, 47 |
| `UNION` | 5 | 31, 34, 36, 39, 41 |
| Window functions | 4 | 33, 35, 40, 43 |
| Date logic | 9 | 9, 16, 20, 22, 24, 34, 39, 40, 49 |
| String functions | 4 | 5, 44, 45, 48 |
| Regular expressions | 1 | 50 |
| Changing data | 1 | 46 |

## Statement quality

The most disliked problems may have unclear statements, so our versions should be especially explicit about the same concepts:

- **Product Sales Analysis III:** 57% dislikes.
- **User Activity for the Past 30 Days I:** 47% dislikes.
- **Classes With at Least 5 Students:** 44% dislikes.
- **Patients With a Condition:** 42% dislikes.
- **Investments in 2016:** 39% dislikes.

We should state the output columns, sort order, tie handling, and empty-result behaviour in every problem.

## Platform requirements

| Requirement | Problems affected | Which ones |
|---|---:|---|
| Support for multiple tables | 13 | 6, 7, 8, 11, 12, 14, 16, 17, 18, 29, 39, 43, 49 |
| Row-order-sensitive comparison | 11 | 4, 12, 15, 18, 27, 30, 37, 38, 40, 44, 48 |
| Decimal-tolerant comparison | 10 | 10, 14, 16, 17, 18, 19, 21, 22, 40, 42 |
| A single NULL row as the expected result | 2 | 28, 47 |
| Checking the final table state | 1 | 46 (already built) |
| Registered `REGEXP` function | 1 | 50 |

## SQLite differences

We tested these on the SQLite 3.54.0 build the app ships with.

| Works | Fails, with the alternative |
|---|---|
| `IF()`, `IIF()`, `IFNULL()`, `COALESCE()` | `DATEDIFF()`: use `julianday()` |
| `CONCAT()`, `\|\|`, `SUBSTRING()`, `SUBSTR()` | `DATE_FORMAT()`, `YEAR()`, `MONTH()`: use `strftime()` |
| `RIGHT JOIN`, `FULL JOIN`, `CROSS JOIN` | `DATE_SUB(... INTERVAL ...)`: use `date(x, '-1 day')` |
| Window functions, `DENSE_RANK`, `LAG`, `LEAD` | `RANGE ... INTERVAL`: use `ROWS` or `julianday()` |
| Tuple `IN`, for example `(a, b) IN (...)` | `LEFT()`: use `SUBSTR()` |
| `HAVING` on a column alias | `CHAR_LENGTH()`: use `LENGTH()` |
| `GROUP_CONCAT(DISTINCT x ORDER BY x)` | `GROUP_CONCAT(x SEPARATOR ',')`: use `GROUP_CONCAT(x, ',')` |
| `LIMIT offset, count` | `MOD()`: use `%` |
| `ROUND(0.125, 2)` returns 0.13 | `COUNT(DISTINCT a, b)`: combine columns or use a subquery |
| | `(SELECT ...) UNION ALL (SELECT ...)`: remove the parentheses, or wrap sorted branches in `FROM` subqueries |
| | `DELETE a FROM t a JOIN ...`: use a `WHERE` subquery |
| | `REGEXP`: the app must register this function |

Three differences return results without any error, so they need explicit teaching:

- **Integer division:** `5 / 2` returns 2, and `COUNT(*) / 4` also truncates. This affects problems 14, 16, 18, 19, 21, 22.
- **`LIKE` ignores case:** `'diab1' LIKE 'DIAB1%'` is true, while `GLOB` is case-sensitive.
- **`=` is case-sensitive:** `'a' = 'A'` is false, unlike MySQL's common default collation.

## Draft curriculum order

> Superseded by the [curriculum plan](curriculum-plan.md). This early draft is kept as a record of the assessment.

This reordering teaches each concept before it's needed. The source numbers show which concepts each module should cover, not problems to copy. Modules with few source problems need original problems added.

| Module | Teaches | Source concepts from problems | Count | Avg level |
|---:|---|---|---:|---:|
| 1. Filtering and NULL | `WHERE`, `DISTINCT`, sorting, NULL logic | 1, 2, 3, 4, 5, 15 | 6 | 1.0 |
| 2. Grouping and aggregates | `GROUP BY`, `HAVING`, `COUNT(DISTINCT)` | 23, 26, 27 | 3 | 2.0 |
| 3. Joins | Inner, left, self, and cross joins; unmatched rows | 6, 7, 11, 8, 17, 13, 30, 12 | 8 | 2.6 |
| 4. Conditional logic and ratios | `CASE`, percentages, safe division, rounding | 32, 38, 19, 20, 10, 36, 14, 16 | 8 | 3.1 |
| 5. Dates | Text dates, ranges, `strftime`, `julianday` | 24, 49, 9 | 3 | 3.0 |
| 6. Subqueries, CTEs, and set operations | Scalar and correlated subqueries, CTEs, `UNION`, multi-step logic | 47, 37, 25, 28, 29, 31, 18, 21, 22, 34, 41, 42, 39 | 13 | 3.5 |
| 7. Window functions | Ranking, `LAG`/`LEAD`, running totals, moving windows | 33, 35, 43, 40 | 4 | 4.5 |
| 8. Strings and patterns | String functions, `LIKE`, `GLOB`, `REGEXP`, `GROUP_CONCAT` | 44, 48, 45, 50 | 4 | 3.0 |
| 9. Changing data | `INSERT`, `UPDATE`, `DELETE`, transactions, constraints | 46 | 1 | 3.0 |

### Gaps to fill with original content

- **Grouping:** only 3 source problems are grouping-only, so this module needs more practice.
- **Dates:** only 3 source problems are mainly about dates, but date logic appears across the plan.
- **Changing data:** `INSERT`, `UPDATE`, transactions, and constraints have no source problems.
- **CTEs:** no problem requires them, but they make multi-step solutions easier for learners to read.
- **Database design and performance:** keys, relationships, indexes, and `EXPLAIN QUERY PLAN` are absent, and could be optional later modules.
- **Dialects:** add a short lesson on how SQLite differs from MySQL and PostgreSQL.

### Design ideas

- **Teach through traps:** add test data for each recurring trap, with a specific hint when learners hit it.
- **Use one shared dataset per module:** the plan introduces a new schema almost every problem, so reuse would reduce reading effort for beginners.
- **Add hints:** LeetCode offers few, so hints are an easy way for Inner Joy to be more helpful.
