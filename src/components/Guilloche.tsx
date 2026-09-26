// Motif guilloché (façon papier-valeur / document officiel), dessiné en encre violette.
import { memo } from 'react';

function rosette(cx: number, cy: number, radius: number, amp: number, lobes: number, phase: number, steps = 360) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = radius + amp * Math.sin(lobes * t + phase);
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    d += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d}Z`;
}

const PATHS = (() => {
  const out: { d: string; w: number }[] = [];
  for (let i = 0; i < 16; i++) {
    out.push({ d: rosette(100, 100, 18 + i * 5.2, 3 + (i % 4), 12 + (i % 3) * 6, i * 0.35), w: i % 4 === 0 ? 0.7 : 0.4 });
  }
  for (let i = 0; i < 10; i++) {
    out.push({ d: rosette(100, 100, 40, 32, 7, (i * Math.PI) / 10, 720), w: 0.35 });
  }
  return out;
})();

export const Guilloche = memo(function Guilloche({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      {PATHS.map((p, i) => (
        <path key={i} d={p.d} fill="none" stroke="currentColor" strokeWidth={p.w} />
      ))}
    </svg>
  );
});

/** Dos de carte : cadre, guilloché central, monogramme. */
export function CardBack({ className = '', label }: { className?: string; label?: string }) {
  return (
    <div className={`card-paper overflow-hidden ${className}`}>
      <div className="absolute inset-[14px] overflow-hidden rounded-[9px] border border-rule text-violet/70">
        <Guilloche className="absolute inset-0 h-full w-full opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full border border-violet/40 bg-card px-4 py-1.5 font-serif text-lg italic text-violet">
            {label ?? 'CsT'}
          </span>
        </div>
      </div>
    </div>
  );
}
