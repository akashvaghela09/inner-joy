import type { Problem } from "../grader";

export const deleteDuplicateEmails: Problem = {
  title: "Delete Duplicate Emails",
  description: [
    "A newsletter's subscribers table contains repeated email addresses. Write SQL that changes the table so each address appears only once, keeping the row with the smallest id for that address.",
    "Emails match only if they are exactly the same, so Sam@example.com and sam@example.com count as different addresses.",
    "Your SQL must change the table itself. A SELECT that only displays the right rows will not pass.",
  ],
  table: "subscribers",
  columns: ["id", "email"],
  createSql: `CREATE TABLE subscribers (
    id    INTEGER PRIMARY KEY,
    email TEXT NOT NULL
  );`,
  checkSql: "SELECT id, email FROM subscribers ORDER BY id;",
  cases: [
    {
      name: "Sample",
      hidden: false,
      input: [
        [1, "maya@example.com"],
        [2, "leo@example.com"],
        [3, "maya@example.com"],
        [4, "priya@example.com"],
        [5, "leo@example.com"],
        [6, "maya@example.com"],
      ],
      expected: [
        [1, "maya@example.com"],
        [2, "leo@example.com"],
        [4, "priya@example.com"],
      ],
    },
    {
      name: "No duplicates",
      hidden: true,
      input: [
        [1, "ana@example.com"],
        [2, "raj@example.com"],
        [3, "tom@example.com"],
      ],
      expected: [
        [1, "ana@example.com"],
        [2, "raj@example.com"],
        [3, "tom@example.com"],
      ],
    },
    {
      name: "Every row has the same email",
      hidden: true,
      input: [
        [4, "only@example.com"],
        [9, "only@example.com"],
        [2, "only@example.com"],
      ],
      expected: [[2, "only@example.com"]],
    },
    {
      name: "Smallest id was not inserted first",
      hidden: true,
      input: [
        [30, "a@example.com"],
        [10, "b@example.com"],
        [20, "a@example.com"],
        [5, "b@example.com"],
      ],
      expected: [
        [5, "b@example.com"],
        [20, "a@example.com"],
      ],
    },
    {
      name: "Emails that differ only by case",
      hidden: true,
      input: [
        [1, "Sam@example.com"],
        [2, "sam@example.com"],
        [3, "sam@example.com"],
      ],
      expected: [
        [1, "Sam@example.com"],
        [2, "sam@example.com"],
      ],
    },
    {
      name: "Empty table",
      hidden: true,
      input: [],
      expected: [],
    },
  ],
};
