import { beforeAll, describe, expect, it } from "vitest";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import { grade } from "./grader";
import { deleteDuplicateEmails as problem } from "./problems/deleteDuplicateEmails";

let SQL: SqlJsStatic;

beforeAll(async () => {
  SQL = await initSqlJs();
});

const correct: Record<string, string> = {
  "NOT IN with MIN": `DELETE FROM subscribers
    WHERE id NOT IN (SELECT MIN(id) FROM subscribers GROUP BY email);`,
  "correlated EXISTS": `DELETE FROM subscribers
    WHERE EXISTS (
      SELECT 1 FROM subscribers s
      WHERE s.email = subscribers.email AND s.id < subscribers.id
    );`,
  "window function": `DELETE FROM subscribers
    WHERE id IN (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS n FROM subscribers
      ) WHERE n > 1
    );`,
  "rebuild through a temporary table": `CREATE TEMP TABLE keep AS
      SELECT MIN(id) AS id, email FROM subscribers GROUP BY email;
    DELETE FROM subscribers;
    INSERT INTO subscribers SELECT id, email FROM keep;`,
};

const wrong: Record<string, string> = {
  "empty submission": "",
  "SELECT only": "SELECT MIN(id), email FROM subscribers GROUP BY email;",
  "keeps the largest id": `DELETE FROM subscribers
    WHERE id NOT IN (SELECT MAX(id) FROM subscribers GROUP BY email);`,
  "removes every copy of a duplicate": `DELETE FROM subscribers
    WHERE email IN (SELECT email FROM subscribers GROUP BY email HAVING COUNT(*) > 1);`,
  "deletes everything": "DELETE FROM subscribers;",
  "ignores case": `DELETE FROM subscribers
    WHERE id NOT IN (SELECT MIN(id) FROM subscribers GROUP BY LOWER(email));`,
  "hard-codes the sample ids": "DELETE FROM subscribers WHERE id IN (3, 5, 6);",
  "drops the table": "DROP TABLE subscribers;",
  "syntax error": "DELET FROM subscribers;",
};

describe("Delete Duplicate Emails", () => {
  it.each(Object.entries(correct))("passes: %s", (_name, sql) => {
    const report = grade(SQL, problem, sql);
    expect(report.cases.filter((c) => !c.passed).map((c) => c.name)).toEqual([]);
    expect(report.passed).toBe(true);
  });

  it.each(Object.entries(wrong))("fails: %s", (_name, sql) => {
    expect(grade(SQL, problem, sql).passed).toBe(false);
  });

  it("catches hard-coded ids with a hidden test, not the sample", () => {
    const { cases } = grade(SQL, problem, wrong["hard-codes the sample ids"]);
    expect(cases.find((c) => !c.hidden)?.passed).toBe(true);
    expect(cases.some((c) => c.hidden && !c.passed)).toBe(true);
  });

  it("does not expose hidden test data in the report", () => {
    const { cases } = grade(SQL, problem, correct["NOT IN with MIN"]);
    for (const result of cases.filter((c) => c.hidden)) {
      expect(result).not.toHaveProperty("expected");
      expect(result).not.toHaveProperty("actual");
    }
  });
});
