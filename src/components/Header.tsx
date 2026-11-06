import { overallProgress } from "../progress";
import { canSaveProgress, useProgress } from "../storage";
import ui from "../ui.module.css";
import { Mark } from "./Icons";

export type Section = "curriculum" | "playground";

export function Header({ section }: { section: Section }) {
  const { completed } = useProgress();
  const { done, total } = overallProgress(completed);

  const link = (name: Section, href: string, label: string) => (
    <a
      className={`${ui.headerLink} ${section === name ? ui.headerLinkActive : ""}`}
      href={href}
      aria-current={section === name ? "page" : undefined}
    >
      {label}
    </a>
  );

  return (
    <>
      <header className={ui.header}>
        <a className={ui.brand} href="#/">
          <span className={ui.mark}>
            <Mark />
          </span>
          Inner Joy
        </a>
        <nav className={ui.headerNav} aria-label="Main">
          {link("curriculum", "#/", "Curriculum")}
          {link("playground", "#/playground", "Playground")}
        </nav>
        <span className={ui.headerCount} aria-label={`${done} of ${total} required assignments complete`}>
          {done}/{total}
        </span>
      </header>
      {!canSaveProgress && <p className={ui.notice}>Progress won't be saved in this browser.</p>}
    </>
  );
}
