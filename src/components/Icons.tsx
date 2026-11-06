import type { ReactNode } from "react";

function Icon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flex: "none" }}>
      {children}
    </svg>
  );
}

const stroke = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Two overlapping circles with a filled intersection, after INNER JOIN. */
export function Mark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flex: "none" }}>
      <path d="M12 6.8a7 7 0 0 1 0 10.4 7 7 0 0 1 0-10.4Z" fill="currentColor" />
      <circle cx="8.5" cy="12" r="6.75" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15.5" cy="12" r="6.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export const NotStartedIcon = () => (
  <Icon>
    <circle cx="8" cy="8" r="6.25" {...stroke} />
  </Icon>
);

export const ExtraIcon = () => (
  <Icon>
    <circle cx="8" cy="8" r="6.25" {...stroke} strokeDasharray="2.5 2.5" />
  </Icon>
);

export const AttemptedIcon = () => (
  <Icon>
    <circle cx="8" cy="8" r="6.25" {...stroke} />
    <path d="M8 1.75a6.25 6.25 0 0 0 0 12.5Z" fill="currentColor" />
  </Icon>
);

export const DoneIcon = () => (
  <Icon>
    <circle cx="8" cy="8" r="7" fill="currentColor" />
    <path d="m4.8 8.3 2.2 2.2 4.2-4.6" stroke="var(--canvas)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const FailedIcon = () => (
  <Icon>
    <circle cx="8" cy="8" r="7" fill="currentColor" />
    <path d="m5.5 5.5 5 5m0-5-5 5" stroke="var(--canvas)" strokeWidth="1.6" strokeLinecap="round" />
  </Icon>
);

export const LockIcon = () => (
  <Icon size={14}>
    <rect x="3" y="7" width="10" height="7" rx="1.5" {...stroke} />
    <path d="M5 7V5a3 3 0 0 1 6 0v2" {...stroke} />
  </Icon>
);

export const EyeOffIcon = () => (
  <Icon>
    <path d="M2 8s2.2-4.25 6-4.25S14 8 14 8s-2.2 4.25-6 4.25S2 8 2 8Z" {...stroke} />
    <path d="m3 2.5 10 11" {...stroke} />
  </Icon>
);

export const BookIcon = () => (
  <Icon>
    <path d="M8 4.2C6.8 3.2 5 2.8 2 3v9.5c3-.2 4.8.2 6 1.2 1.2-1 3-1.4 6-1.2V3c-3-.2-4.8.2-6 1.2Zm0 0v9.5" {...stroke} />
  </Icon>
);

export const ExternalLinkIcon = () => (
  <Icon size={14}>
    <path d="M6.5 3H3v10h10V9.5M9 3h4v4M13 3 7.5 8.5" {...stroke} />
  </Icon>
);

export const ChevronRightIcon = () => (
  <Icon>
    <path d="m6 3.5 4.5 4.5L6 12.5" {...stroke} />
  </Icon>
);

export const ChevronLeftIcon = () => (
  <Icon>
    <path d="M10 3.5 5.5 8l4.5 4.5" {...stroke} />
  </Icon>
);

export const ChevronUpIcon = () => (
  <Icon>
    <path d="M3.5 10 8 5.5l4.5 4.5" {...stroke} />
  </Icon>
);
