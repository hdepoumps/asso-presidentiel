// Pictogrammes dessinés à la main, trait de 1,6 px, pour rester dans l'esprit « imprimé ».
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconCross = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);
export const IconCheck = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);
export const IconArrowRight = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
);
export const IconArrowLeft = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M16 10H4M9 5l-5 5 5 5" />
  </svg>
);
export const IconUndo = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M7 5L3.5 8.5 7 12" />
    <path d="M4 8.5h7.5a4.5 4.5 0 010 9H9" />
  </svg>
);
/** Signet : « important pour moi ». */
export const IconBookmark = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M5.5 3h9v14l-4.5-3.5L5.5 17z" fill={filled ? 'currentColor' : 'none'} />
  </svg>
);
export const IconExternal = (p: P) => (
  <svg {...base} width={14} height={14} {...p} aria-hidden="true">
    <path d="M8 4H4v12h12v-4M11 3h6v6M17 3l-8 8" />
  </svg>
);
export const IconLock = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
    <path d="M7 9V6.5a3 3 0 016 0V9" />
  </svg>
);
export const IconUnlock = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
    <path d="M7 9V6.5a3 3 0 015.6-1.5" />
  </svg>
);
export const IconQuestion = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <circle cx="10" cy="10" r="7.5" />
    <path d="M7.8 7.8a2.3 2.3 0 114 1.6c-.9.6-1.8 1.1-1.8 2.3" />
    <circle cx="10" cy="14.4" r=".4" fill="currentColor" />
  </svg>
);
export const IconEye = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" />
    <circle cx="10" cy="10" r="2.3" />
  </svg>
);
export const IconDownload = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M10 3v10M6 9l4 4 4-4M4 16h12" />
  </svg>
);
export const IconShare = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M10 3v10M6 7l4-4 4 4M5 11v5h10v-5" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
  </svg>
);
/** Haut-parleur : écouter la carte. */
export const IconSpeaker = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M3.5 8v4h3l4 3.5v-11l-4 3.5z" />
    <path d="M13.5 7.5a3.5 3.5 0 010 5M15.5 5.5a6.3 6.3 0 010 9" />
  </svg>
);
export const IconStop = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <rect x="5.5" y="5.5" width="9" height="9" rx="1.5" fill="currentColor" />
  </svg>
);
/** Curseurs de réglage. */
export const IconSliders = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M4 6h5M13 6h3M4 14h2M10 14h6" />
    <circle cx="11" cy="6" r="2" />
    <circle cx="8" cy="14" r="2" />
  </svg>
);

/** Logo : une carte à jouer, un hémicycle de sièges. */
const MARK_SEATS: [number, number][] = [];
for (const [r, n] of [
  [4.4, 5],
  [6.5, 7],
  [8.6, 9],
] as const) {
  for (let i = 0; i < n; i++) {
    const t = Math.PI - (Math.PI * i) / (n - 1);
    MARK_SEATS.push([16 + r * Math.cos(t), 20.2 - r * Math.sin(t)]);
  }
}

export function Mark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g transform="rotate(-7 16 16)">
        <rect x="6" y="2" width="20" height="28" rx="3.2" fill="var(--card)" stroke="currentColor" strokeWidth="1.6" />
        <rect x="8.2" y="4.2" width="15.6" height="23.6" rx="1.8" fill="none" stroke="currentColor" strokeWidth=".5" />
        {MARK_SEATS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.05" fill="var(--violet)" />
        ))}
      </g>
    </svg>
  );
}
