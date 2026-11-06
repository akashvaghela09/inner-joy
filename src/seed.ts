// Sample data loaded into a new in-memory database on each page load.
export const SEED_SQL = `
CREATE TABLE departments (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE employees (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  salary        INTEGER NOT NULL,
  hire_date     TEXT NOT NULL
);

INSERT INTO departments (id, name) VALUES
  (1, 'Engineering'),
  (2, 'Sales'),
  (3, 'Support');

INSERT INTO employees (id, name, department_id, salary, hire_date) VALUES
  (1, 'Asha',  1, 95000, '2021-03-15'),
  (2, 'Ben',   1, 82000, '2022-07-01'),
  (3, 'Chloe', 2, 61000, '2020-11-20'),
  (4, 'Dev',   2, 58000, '2023-01-09'),
  (5, 'Elena', NULL, 47000, '2024-05-30');
`;
