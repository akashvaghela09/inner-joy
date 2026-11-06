import type { Progress } from "../progress";
import ui from "../ui.module.css";

type Props = {
  progress: Progress;
  name: string;
  size: "large" | "small";
};

export function ProgressBar({ progress: { done, available, total }, name, size }: Props) {
  const percent = (value: number) => `${(value / total) * 100}%`;
  const remaining = available - done;
  return (
    <div
      className={`${ui.bar} ${size === "large" ? ui.barLarge : ui.barSmall}`}
      role="progressbar"
      aria-label={name}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-valuetext={`${done} of ${total} required complete, ${available} available now`}
    >
      {done > 0 && <div className={ui.barDone} style={{ width: percent(done) }} />}
      {remaining > 0 && <div className={ui.barAvailable} style={{ width: percent(remaining) }} />}
    </div>
  );
}
