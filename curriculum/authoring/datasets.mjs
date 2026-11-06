// Shared data for the curriculum. Each `alt` replaces the rows for hidden tests,
// and deliberately includes boundaries, NULLs, ties, and unmatched rows.
export const datasets = [
  {
    id: "staff",
    title: "Staff Directory",
    story: "A small company keeps its departments and employees in two connected tables. An employee's manager_id points to another employee.",
    schemaSql:
      "CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL); CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT NOT NULL, department_id INTEGER, manager_id INTEGER, salary INTEGER NOT NULL, hire_date TEXT NOT NULL, bonus INTEGER, email TEXT);",
    seedSql:
      "INSERT INTO departments VALUES (1, 'Engineering'), (2, 'Sales'), (3, 'Support'), (4, 'Legal'); INSERT INTO employees VALUES (1, 'Asha', 1, NULL, 120000, '2018-03-15', 10000, 'asha@acme.test'), (2, 'Ben', 1, 1, 95000, '2019-07-01', NULL, 'ben@acme.test'), (3, 'Chloe', 1, 1, 95000, '2021-01-20', 5000, NULL), (4, 'Dev', 2, 1, 70000, '2020-11-09', 2000, 'dev@acme.test'), (5, 'Elena', 2, 4, 62000, '2022-05-30', NULL, 'elena@acme.test'), (6, 'Farid', 2, 4, 58000, '2023-02-14', 0, 'farid@acme.test'), (7, 'Grace', 3, 1, 48000, '2021-09-01', NULL, NULL), (8, 'Hugo', NULL, 99, 41000, '2024-01-10', NULL, 'hugo@acme.test');",
    alt: "DELETE FROM employees; DELETE FROM departments; INSERT INTO departments VALUES (5, 'Design'), (6, 'Finance'), (7, 'Ops'); INSERT INTO employees VALUES (11, 'Ivy', 5, NULL, 90000, '2019-02-01', 900, 'ivy@acme.test'), (12, 'Jon', 5, 11, 70000, '2020-06-15', NULL, NULL), (13, 'Kim', 6, 11, 70000, '2023-03-03', 300, 'kim@acme.test'), (14, 'Leo', NULL, 77, 30000, '2024-08-20', NULL, 'leo@acme.test'), (15, 'Mia', 6, 13, 55000, '2022-12-31', 0, 'mia@acme.test');",
  },
  {
    id: "shop",
    title: "Online Shop",
    story: "An online shop records customers, products, orders, and the items in each order.",
    schemaSql:
      "CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL, email TEXT, signup_date TEXT NOT NULL); CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL, cost REAL NOT NULL); CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, order_date TEXT NOT NULL, status TEXT NOT NULL); CREATE TABLE order_items (order_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL, discount REAL);",
    seedSql:
      "INSERT INTO customers VALUES (1, 'Priya', 'Pune', 'priya@mail.test', '2023-01-10'), (2, 'Marco', 'Rome', NULL, '2023-02-14'), (3, 'Hana', 'Tokyo', 'hana@mail.test', '2023-03-03'), (4, 'Luis', 'Rome', 'luis@mail.test', '2023-03-20'), (5, 'Noor', 'Pune', NULL, '2023-04-02'); INSERT INTO products VALUES (1, 'Notebook', 'Stationery', 4.0, 1.5), (2, 'Pen', 'Stationery', 1.5, 0.5), (3, 'Mug', 'Kitchen', 9.0, 4.0), (4, 'Kettle', 'Kitchen', 35.0, 20.0), (5, 'Lamp', 'Home', 25.0, 12.0), (6, 'Rug', 'Home', 60.0, 30.0); INSERT INTO orders VALUES (1, 1, '2024-01-05', 'shipped'), (2, 2, '2024-01-17', 'shipped'), (3, 1, '2024-02-03', 'cancelled'), (4, 3, '2024-02-20', 'shipped'), (5, 4, '2024-03-02', 'pending'), (6, 3, '2024-03-15', 'shipped'); INSERT INTO order_items VALUES (1, 1, 3, NULL), (1, 2, 2, 0.5), (2, 3, 1, NULL), (3, 4, 1, 5.0), (4, 5, 2, NULL), (4, 1, 1, NULL), (5, 3, 2, 1.0), (6, 4, 1, NULL), (6, 2, 4, NULL);",
    alt: "DELETE FROM order_items; DELETE FROM orders; DELETE FROM products; DELETE FROM customers; INSERT INTO customers VALUES (7, 'Ravi', 'Oslo', 'ravi@mail.test', '2024-05-05'), (8, 'Sara', 'Lima', NULL, '2024-06-06'), (9, 'Tom', 'Oslo', NULL, '2024-07-07'); INSERT INTO products VALUES (7, 'Stool', 'Home', 40.0, 25.0), (8, 'Cup', 'Kitchen', 9.0, 2.0), (9, 'Ink', 'Stationery', 12.5, 6.0); INSERT INTO orders VALUES (11, 7, '2024-02-28', 'shipped'), (12, 8, '2024-03-01', 'pending'), (13, 7, '2024-03-31', 'cancelled'); INSERT INTO order_items VALUES (11, 7, 1, 4.0), (11, 8, 3, NULL), (12, 9, 2, NULL), (13, 8, 1, NULL);",
  },
  {
    id: "weather",
    title: "Weather Log",
    story: "A weather service logs one reading per city per day. Rainfall can be missing when a gauge fails.",
    schemaSql: "CREATE TABLE readings (id INTEGER PRIMARY KEY, city TEXT NOT NULL, reading_date TEXT NOT NULL, temp_c INTEGER NOT NULL, rainfall_mm REAL);",
    seedSql:
      "INSERT INTO readings VALUES (1, 'Oslo', '2024-03-01', 2, 1.5), (2, 'Oslo', '2024-03-02', 4, NULL), (3, 'Oslo', '2024-03-03', 3, 0.0), (4, 'Oslo', '2024-03-05', 7, 2.5), (5, 'Lima', '2024-03-01', 24, 0.0), (6, 'Lima', '2024-03-02', 26, NULL), (7, 'Lima', '2024-03-03', 26, 4.0), (8, 'Lima', '2024-03-04', 25, 1.0);",
    alt: "DELETE FROM readings; INSERT INTO readings VALUES (11, 'Cairo', '2024-07-30', 38, 0.0), (12, 'Cairo', '2024-07-31', 40, NULL), (13, 'Cairo', '2024-08-01', 41, 0.5), (14, 'Quito', '2024-07-31', 15, 3.0), (15, 'Quito', '2024-08-01', 14, 3.0), (16, 'Quito', '2024-08-03', 18, NULL);",
  },
  {
    id: "school",
    title: "Riverside School",
    story: "A school records students, courses, and enrolments. A grade is empty until the course is finished, and a student can repeat a course.",
    schemaSql:
      "CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, year_group INTEGER NOT NULL); CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT NOT NULL, subject TEXT NOT NULL); CREATE TABLE enrolments (id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL, course_id INTEGER NOT NULL, grade INTEGER, term TEXT NOT NULL);",
    seedSql:
      "INSERT INTO students VALUES (1, 'Anya', 10), (2, 'Bilal', 10), (3, 'Cara', 11), (4, 'Dmitri', 11), (5, 'Esi', 12); INSERT INTO courses VALUES (1, 'Algebra', 'Maths'), (2, 'Geometry', 'Maths'), (3, 'Biology', 'Science'), (4, 'Poetry', 'English'); INSERT INTO enrolments VALUES (1, 1, 1, 82, '2024-spring'), (2, 1, 3, 91, '2024-spring'), (3, 2, 1, 55, '2024-spring'), (4, 2, 1, 71, '2024-autumn'), (5, 3, 2, NULL, '2024-autumn'), (6, 3, 3, 67, '2024-spring'), (7, 4, 1, 91, '2024-spring'), (8, 4, 2, 74, '2024-autumn'), (9, 4, 3, 88, '2024-autumn');",
    alt: "DELETE FROM enrolments; DELETE FROM courses; DELETE FROM students; INSERT INTO students VALUES (6, 'Femi', 9), (7, 'Gia', 9), (8, 'Hao', 10); INSERT INTO courses VALUES (5, 'Chemistry', 'Science'), (6, 'Drama', 'Arts'); INSERT INTO enrolments VALUES (11, 6, 5, 60, '2023-autumn'), (12, 6, 5, 60, '2024-spring'), (13, 7, 5, NULL, '2024-spring'), (14, 7, 6, 95, '2024-spring');",
  },
  {
    id: "contacts",
    title: "Contact List",
    story: "A membership club keeps a messy list of contacts, including names, emails, phone numbers, and space-separated tags.",
    schemaSql: "CREATE TABLE contacts (id INTEGER PRIMARY KEY, full_name TEXT NOT NULL, email TEXT, phone TEXT, city TEXT, tags TEXT NOT NULL);",
    seedSql:
      "INSERT INTO contacts VALUES (1, 'ada lovelace', 'ada@club.test', '555-0101', 'London', 'VIP GOLD1'), (2, 'Grace HOPPER', 'grace.h@club.test', '555-0102', 'New York', 'GOLD2 NEW'), (3, 'alan turing', 'alan@other.test', NULL, 'London', 'XGOLD1'), (4, 'Katherine Johnson', 'kj_99@club.test', '5550104', NULL, 'NEW'), (5, 'edsger dijkstra', '1edsger@club.test', '555-0105', 'Austin', ''), (6, 'Tim Lee', NULL, '555-0106', 'Geneva', 'GOLD1');",
    alt: "DELETE FROM contacts; INSERT INTO contacts VALUES (11, 'mary jackson', 'mary-j@club.test', '555-0111', 'Hampton', 'SILVER GOLD1'), (12, 'BOB Kahn', 'bob@CLUB.test', '555-0112', NULL, 'gold1'), (13, 'Rosa Park', 'rosa@club-test', NULL, 'Tuskegee', 'NEW'), (14, 'Ken Thompson', 'ken.t@club.test', '5550114', 'Murray', 'GOLD3');",
  },
  {
    id: "app",
    title: "App Activity",
    story: "A mobile app stores its users and one row per session. A user's referrer_id points to the user who invited them.",
    schemaSql:
      "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT NOT NULL, referrer_id INTEGER, signup_date TEXT NOT NULL); CREATE TABLE sessions (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, session_date TEXT NOT NULL, minutes INTEGER NOT NULL, device TEXT NOT NULL);",
    seedSql:
      "INSERT INTO users VALUES (1, 'nova', NULL, '2024-01-01'), (2, 'orbit', 1, '2024-01-03'), (3, 'pixel', 1, '2024-01-03'), (4, 'quark', 2, '2024-01-10'), (5, 'raven', NULL, '2024-01-12'); INSERT INTO sessions VALUES (1, 1, '2024-01-01', 10, 'ios'), (2, 1, '2024-01-02', 25, 'ios'), (3, 1, '2024-01-03', 5, 'web'), (4, 2, '2024-01-03', 40, 'android'), (5, 2, '2024-01-05', 15, 'android'), (6, 3, '2024-01-04', 20, 'web'), (7, 3, '2024-01-05', 20, 'web'), (8, 4, '2024-01-10', 30, 'ios'), (9, 4, '2024-01-10', 12, 'web');",
    alt: "DELETE FROM sessions; DELETE FROM users; INSERT INTO users VALUES (7, 'sable', NULL, '2024-02-27'), (8, 'tulip', 7, '2024-02-28'), (9, 'umber', 7, '2024-03-01'); INSERT INTO sessions VALUES (11, 7, '2024-02-28', 50, 'web'), (12, 7, '2024-02-29', 50, 'web'), (13, 7, '2024-03-01', 7, 'ios'), (14, 8, '2024-03-02', 33, 'android');",
  },
];
