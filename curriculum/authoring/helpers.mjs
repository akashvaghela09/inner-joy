/** Short form for one assignment: A(id, dataset, title, prompt, hint, solution, wrong, opts). */
export const A = (id, dataset, title, prompt, hint, solution, wrong, opts) => ({
  id,
  dataset,
  title,
  prompt,
  hint,
  solution,
  wrong,
  opts,
});

/** Short form for one lesson: L(skill, summary, points, dataset, sql, explanation). */
export const L = (skill, summary, points, dataset, sql, explanation) => ({
  skill,
  summary,
  points,
  example: { dataset, sql, explanation },
});
