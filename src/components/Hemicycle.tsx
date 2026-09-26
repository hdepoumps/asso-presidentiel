// « Votre hémicycle » : 577 sièges, encrés selon l'accord de chaque député avec vos réponses.
import { useMemo, useRef, useState, type PointerEvent } from 'react';
import type { HemicycleDepute } from '../types';
import { groupOrderFromSeats, layoutHemicycle, type DeputeAgreement, type Seat } from '../lib/hemicycle';
import { groupsById } from '../lib/content';

const BINS = [0.2, 0.4, 0.6, 0.8];
const SHADES = [6, 24, 46, 72, 100];

function shade(score: number | null): string {
  if (score == null) return 'transparent';
  const bin = BINS.filter((b) => score >= b).length;
  return `color-mix(in oklab, var(--violet) ${SHADES[bin]}%, var(--card))`;
}

const groupName = (g: string) => groupsById[g]?.name ?? 'Non inscrits';

export function Hemicycle({
  deputes,
  agreements,
}: {
  deputes: HemicycleDepute[];
  agreements: Map<string, DeputeAgreement>;
}) {
  const { seats, dot } = useMemo(() => layoutHemicycle(deputes), [deputes]);
  const order = useMemo(() => groupOrderFromSeats(deputes), [deputes]);
  const [focusGroup, setFocusGroup] = useState<string | null>(null);
  const [selected, setSelected] = useState<Seat | null>(null);
  const [showList, setShowList] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const down = useRef<{ x: number; y: number } | null>(null);

  // Sélection au relâchement, et seulement si le doigt n'a presque pas bougé (sinon c'est un défilement).
  function onPointerUp(e: PointerEvent<SVGSVGElement>) {
    const start = down.current;
    down.current = null;
    if (!start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) return;
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    let best: Seat | null = null;
    let bestD = (dot * 3) ** 2;
    for (const s of seats) {
      const d = (s.x - p.x) ** 2 + (s.y - p.y) ** 2;
      if (d < bestD) {
        best = s;
        bestD = d;
      }
    }
    setSelected(best);
  }

  const sel = selected ? agreements.get(selected.depute.ref) : null;
  const groupStats = useMemo(() => {
    const stats: Record<string, { sum: number; n: number; seats: number }> = {};
    for (const d of deputes) {
      const a = agreements.get(d.ref);
      const s = (stats[d.groupe] ??= { sum: 0, n: 0, seats: 0 });
      s.seats++;
      if (a?.score != null) {
        s.sum += a.score;
        s.n++;
      }
    }
    return stats;
  }, [deputes, agreements]);

  return (
    <figure className="m-0">
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox="-1.05 -1.05 2.1 1.12"
          className="w-full select-none"
          role="img"
          aria-label="Hémicycle de l'Assemblée nationale : chaque point est un député ; plus sa couleur est intense, plus ses votes rejoignent vos réponses. La liste détaillée est disponible sous le dessin."
          onPointerDown={(e) => (down.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (down.current = null)}
        >
          {seats.map((s) => {
            const a = agreements.get(s.depute.ref);
            const dim = focusGroup && s.depute.groupe !== focusGroup;
            const mostlyEstimated = a && a.estimated > a.personal;
            const isSel = selected?.depute.ref === s.depute.ref;
            return (
              <circle
                key={s.depute.ref}
                cx={s.x}
                cy={s.y}
                r={mostlyEstimated ? dot * 0.78 : dot}
                fill={shade(a?.score ?? null)}
                stroke={isSel ? 'var(--ink)' : a?.score == null ? 'var(--rule-2)' : 'color-mix(in oklab, var(--violet) 60%, var(--card))'}
                strokeWidth={isSel ? dot * 0.5 : dot * 0.18}
                opacity={dim ? 0.12 : 1}
                style={{ transition: 'opacity .25s, fill .4s' }}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center text-center" aria-hidden="true">
          {selected && sel ? (
            <p className="serif-num text-[clamp(1.5rem,7vw,2.8rem)] leading-none text-violet">
              {sel.score == null ? '—' : `${Math.round(sel.score * 100)} %`}
            </p>
          ) : (
            <p className="max-w-[30%] text-[clamp(0.65rem,2.3vw,0.85rem)] leading-tight text-ink-3">Touchez un siège</p>
          )}
        </div>
      </div>
      <p className="mt-3 min-h-[2.8rem] text-center text-sm text-ink-2" aria-live="polite">
        {selected && sel ? (
          <>
            <b className="font-serif text-base font-medium text-ink">{selected.depute.nom}</b>
            <span className="text-ink-3"> · {groupName(selected.depute.groupe)}</span>
            <br />
            <span className="text-xs text-ink-3">
              accord {sel.score == null ? '—' : `${Math.round(sel.score * 100)} %`} · {sel.personal} vote{sel.personal > 1 ? 's' : ''}{' '}
              personnel{sel.personal > 1 ? 's' : ''}
              {sel.estimated > 0 && ` · ${sel.estimated} estimé${sel.estimated > 1 ? 's' : ''} d’après son groupe (n’a pas voté)`}
            </span>
          </>
        ) : (
          <span className="text-ink-3">Touchez un siège pour voir le député et son accord avec vous.</span>
        )}
      </p>

      <figcaption className="mt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
          <span>Votes opposés aux vôtres</span>
          <span className="flex" aria-hidden="true">
            {SHADES.map((p) => (
              <span
                key={p}
                className="h-3 w-7 border-y border-rule-2 first:rounded-l-full first:border-l last:rounded-r-full last:border-r"
                style={{ background: `color-mix(in oklab, var(--violet) ${p}%, var(--card))` }}
              />
            ))}
          </span>
          <span>Votes identiques</span>
        </div>
        <p className="mt-2 text-xs text-ink-3">
          Grand point : le député a voté sur la plupart de vos cartes (ou a déclaré son vote par une mise au point officielle). Petit point :
          il n’a souvent pas voté (absence, présidence de séance…) et l’on a pris la position de son groupe à la date du vote. Disposition des
          groupes d’après les numéros de sièges officiels.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Mettre un groupe en évidence">
          {order.map((g) => {
            const st = groupStats[g];
            const on = focusGroup === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                onClick={() => setFocusGroup(on ? null : g)}
                className={`min-h-8 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  on ? 'border-ink bg-ink text-card' : 'border-rule-2 text-ink-2 hover:border-ink'
                }`}
                aria-label={`${groupName(g)}${st?.n ? `, accord moyen ${Math.round((st.sum / st.n) * 100)} %` : ''}`}
              >
                {groupsById[g]?.short ?? 'NI'}
                {st?.n ? <span className="ml-1 opacity-80">{Math.round((st.sum / st.n) * 100)} %</span> : null}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="link mt-4 min-h-8 text-sm text-ink-2"
          aria-expanded={showList}
          aria-controls="liste-deputes"
          onClick={() => setShowList((v) => !v)}
        >
          {showList ? 'Masquer la liste des députés' : 'Voir la liste des députés'}
        </button>
        {showList && <DeputeList id="liste-deputes" deputes={deputes} agreements={agreements} order={order} />}
      </figcaption>
    </figure>
  );
}

/** Alternative textuelle à l'hémicycle : les députés par groupe, du plus proche au plus éloigné. */
function DeputeList({
  id,
  deputes,
  agreements,
  order,
}: {
  id: string;
  deputes: HemicycleDepute[];
  agreements: Map<string, DeputeAgreement>;
  order: string[];
}) {
  return (
    <div id={id} className="mt-3 max-h-[28rem] space-y-5 overflow-y-auto rounded-xl border border-rule p-4" tabIndex={0}>
      {order.map((g) => {
        const rows = deputes
          .filter((d) => d.groupe === g)
          .map((d) => ({ d, a: agreements.get(d.ref) }))
          .sort((x, y) => (y.a?.score ?? -1) - (x.a?.score ?? -1) || x.d.nom.localeCompare(y.d.nom, 'fr'));
        return (
          <table key={g} className="w-full text-sm num">
            <caption className="kicker pb-1 text-left text-ink-3">{groupName(g)}</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Député</th>
                <th scope="col">Accord</th>
                <th scope="col">Votes personnels</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ d, a }) => (
                <tr key={d.ref} className="border-t border-rule">
                  <th scope="row" className="py-1 text-left font-normal text-ink">
                    {d.nom}
                  </th>
                  <td className="py-1 text-right">{a?.score == null ? '—' : `${Math.round(a.score * 100)} %`}</td>
                  <td className="w-28 py-1 text-right text-xs text-ink-3">
                    {a ? `${a.personal} perso. / ${a.personal + a.estimated}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      })}
    </div>
  );
}
