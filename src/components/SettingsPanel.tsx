// Réglages : son, affichage et accessibilité. Utilisé dans le menu de la partie et sur la page « Réglages ».
import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, SPEECH_RATES, TEXT_SCALES, isDefault, useSettings, type FontChoice, type Settings, type ThemeChoice } from '../settings';
import { useGame } from '../store';
import { play } from '../lib/audio';
import { speak, speechSupported, stopSpeaking, useSpeaking } from '../lib/speech';
import { IconSpeaker, IconStop } from './Icons';

export function PanelSection({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  const auto = useId();
  const hid = id ?? auto;
  return (
    <section aria-labelledby={hid} className="border-t border-ink pt-3 pb-6">
      <h3 id={hid} className="kicker text-violet">
        {title}
      </h3>
      <div className="mt-1 divide-y divide-rule">{children}</div>
    </section>
  );
}

export function Toggle({
  label,
  hint,
  checked,
  onChange,
  disabled = false,
}: {
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  onChange: (on: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <label htmlFor={id} className={`min-w-0 flex-1 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <span className="block font-medium text-ink">{label}</span>
        {hint && (
          <span id={`${id}-aide`} className="mt-0.5 block text-sm leading-snug text-ink-3">
            {hint}
          </span>
        )}
      </label>
      <span className="switch">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          aria-describedby={hint ? `${id}-aide` : undefined}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span aria-hidden="true" />
      </span>
    </div>
  );
}

function Choice<T extends string | number>({
  legend,
  hint,
  value,
  options,
  onChange,
  columns,
}: {
  legend: ReactNode;
  hint?: ReactNode;
  value: T;
  options: { value: T; label: ReactNode; style?: CSSProperties }[];
  onChange: (v: T) => void;
  columns: number;
}) {
  const name = useId();
  return (
    <fieldset className="py-3">
      <legend className="float-left w-full font-medium text-ink">{legend}</legend>
      {hint && <p className="clear-left pt-0.5 text-sm leading-snug text-ink-3">{hint}</p>}
      <div className="clear-left grid gap-1.5 pt-2.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <label key={String(o.value)} className="relative block cursor-pointer">
            <input
              type="radio"
              name={name}
              value={String(o.value)}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              style={o.style}
              className="flex min-h-11 items-center justify-center rounded-xl border border-rule-2 px-2 py-2 text-center text-sm leading-tight text-ink-2 transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-card peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet hover:border-violet"
            >
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Volume({ label, value, disabled, onChange, onCommit }: { label: string; value: number; disabled: boolean; onChange: (v: number) => void; onCommit?: () => void }) {
  const id = useId();
  const pct = Math.round(value * 100);
  return (
    <div className={`pt-1 pb-3 ${disabled ? 'opacity-50' : ''}`}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm text-ink-2">
        <span>{label}</span>
        <span className="num text-ink">{pct} %</span>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={pct}
        disabled={disabled}
        aria-valuetext={`${pct} %`}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        onPointerUp={onCommit}
        onKeyUp={(e) => {
          if (e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End' || e.key.startsWith('Page')) onCommit?.();
        }}
        className="mt-1 block h-8 w-full cursor-pointer accent-violet disabled:cursor-not-allowed"
      />
    </div>
  );
}

const THEME_LABEL: Record<ThemeChoice, string> = { auto: 'Automatique', light: 'Clair', dark: 'Sombre' };
const FONT_LABEL: Record<FontChoice, string> = { standard: 'Standard', hyperlegible: 'Très lisible', dyslexic: 'Dyslexie' };
const FONT_FAMILY: Record<FontChoice, string | undefined> = {
  standard: undefined,
  hyperlegible: "'Atkinson Hyperlegible', system-ui, sans-serif",
  dyslexic: "'OpenDyslexic', system-ui, sans-serif",
};
const RATE_LABEL: Record<number, string> = { 0.8: 'Lente', 1: 'Normale', 1.2: 'Rapide' };
const pct = (v: number) => `${Math.round(v * 100)} %`;
const yes = (on: boolean) => (on ? 'activé' : 'désactivé');

/** Description lisible de chaque réglage, pour la liste des valeurs par défaut. */
export const SETTING_DESCRIPTIONS: { label: string; value: (s: Settings) => string }[] = [
  { label: 'Bruitages', value: (s) => `${yes(s.sfx)}, volume ${pct(s.sfxVolume)}` },
  { label: 'Musique', value: (s) => `${yes(s.music)}, volume ${pct(s.musicVolume)}` },
  { label: 'Thème', value: (s) => (s.theme === 'auto' ? 'automatique (celui de l’appareil)' : THEME_LABEL[s.theme].toLowerCase()) },
  { label: 'Taille du texte', value: (s) => pct(s.textScale) },
  { label: 'Contraste renforcé', value: (s) => yes(s.contrast) },
  { label: 'Police', value: (s) => FONT_LABEL[s.font].toLowerCase() },
  { label: 'Texte aéré', value: (s) => yes(s.spacing) },
  { label: 'Réduire les animations', value: (s) => (s.reduceMotion ? 'activé' : 'selon l’appareil') },
  { label: 'Glisser la carte pour voter', value: (s) => yes(s.swipe) },
  { label: 'Lecture à voix haute', value: (s) => `${yes(s.readAloud)}, vitesse ${RATE_LABEL[s.speechRate].toLowerCase()}` },
];

export function SettingsPanel() {
  const s = useSettings();
  const set = s.set;
  const shortcuts = useGame((g) => g.shortcuts);
  const setShortcuts = useGame((g) => g.setShortcuts);
  const speaking = useSpeaking();
  const [status, setStatus] = useState('');
  const canSpeak = speechSupported();
  const allDefault = isDefault(s) && shortcuts;

  return (
    <div>
      <PanelSection title="Son">
        <Toggle
          label="Bruitages"
          hint="Tampon, cartes qui glissent, carillon quand le vote s’ouvre. Aucune information n’est donnée uniquement par le son."
          checked={s.sfx}
          onChange={(on) => {
            set('sfx', on);
            if (on) play('deverrouille', { maxLag: 1500 });
          }}
        />
        <Volume label="Volume des bruitages" value={s.sfxVolume} disabled={!s.sfx} onChange={(v) => set('sfxVolume', v)} onCommit={() => play('tampon', { maxLag: 1500 })} />
        <Toggle
          label="Musique « Délibération »"
          hint="Une valse lente composée pour Cartes sur Table, jouée en boucle. Elle s’arrête quand l’application passe en arrière-plan."
          checked={s.music}
          onChange={(on) => set('music', on)}
        />
        <Volume label="Volume de la musique" value={s.musicVolume} disabled={!s.music} onChange={(v) => set('musicVolume', v)} />
      </PanelSection>

      <PanelSection title="Affichage">
        <Choice
          legend="Thème"
          value={s.theme}
          columns={3}
          options={(['auto', 'light', 'dark'] as const).map((v) => ({ value: v, label: THEME_LABEL[v] }))}
          onChange={(v) => set('theme', v)}
        />
        <Choice
          legend="Taille du texte"
          value={s.textScale}
          columns={4}
          options={TEXT_SCALES.map((v) => ({
            value: v,
            label: (
              <span className="flex flex-col items-center leading-none">
                <span aria-hidden="true" className="font-serif" style={{ fontSize: `${v * 17}px` }}>
                  Aa
                </span>
                <span className="mt-1 text-xs">{pct(v)}</span>
              </span>
            ),
          }))}
          onChange={(v) => set('textScale', v)}
        />
      </PanelSection>

      <PanelSection title="Accessibilité">
        <Toggle
          label="Contraste renforcé"
          hint="Encres plus sombres, bordures plus marquées, sans texture de papier."
          checked={s.contrast}
          onChange={(on) => set('contrast', on)}
        />
        <Choice
          legend="Police de caractères"
          hint="« Très lisible » : Atkinson Hyperlegible, conçue pour les personnes malvoyantes. « Dyslexie » : OpenDyslexic."
          value={s.font}
          columns={3}
          options={(['standard', 'hyperlegible', 'dyslexic'] as const).map((v) => ({
            value: v,
            label: FONT_LABEL[v],
            style: FONT_FAMILY[v] ? { fontFamily: FONT_FAMILY[v] } : undefined,
          }))}
          onChange={(v) => set('font', v)}
        />
        <Toggle
          label="Texte aéré"
          hint="Plus d’espace entre les lignes, les mots et les lettres."
          checked={s.spacing}
          onChange={(on) => set('spacing', on)}
        />
        <Toggle
          label="Réduire les animations"
          hint="Les cartes ne glissent plus, rien ne clignote ni ne tourne. Désactivé, l’application suit le réglage de votre appareil."
          checked={s.reduceMotion}
          onChange={(on) => set('reduceMotion', on)}
        />
        <Toggle
          label="Glisser la carte pour voter"
          hint="Désactivé, on vote uniquement avec les boutons : aucun vote par un geste involontaire."
          checked={s.swipe}
          onChange={(on) => set('swipe', on)}
        />
        <Toggle
          label="Lecture à voix haute"
          hint={
            canSpeak
              ? 'Ajoute un bouton « Écouter » sur chaque carte, qui lit la question, les arguments ou les détails avec la voix de votre appareil.'
              : 'Votre navigateur ne propose pas de synthèse vocale. Les lecteurs d’écran (VoiceOver, TalkBack, NVDA) restent pris en charge.'
          }
          checked={s.readAloud && canSpeak}
          disabled={!canSpeak}
          onChange={(on) => {
            set('readAloud', on);
            if (!on) stopSpeaking();
          }}
        />
        {s.readAloud && canSpeak && (
          <div className="pb-3">
            <Choice
              legend="Vitesse de lecture"
              value={s.speechRate}
              columns={3}
              options={SPEECH_RATES.map((v) => ({ value: v, label: RATE_LABEL[v] }))}
              onChange={(v) => set('speechRate', v)}
            />
            <button
              type="button"
              className="btn-line min-h-11 py-2 text-sm"
              aria-pressed={speaking}
              onClick={() =>
                speaking ? stopSpeaking() : void speak('Voici la voix qui lira les cartes. Vous pouvez changer sa vitesse ici.', s.speechRate)
              }
            >
              {speaking ? <IconStop width={16} height={16} /> : <IconSpeaker width={18} height={18} />}
              {speaking ? 'Arrêter' : 'Essayer la voix'}
            </button>
          </div>
        )}
        <Toggle
          label="Raccourcis clavier"
          hint="← contre, → pour, N neutre, P ne se prononce pas, I important, 1 à 3 pour les écrans de la carte."
          checked={shortcuts}
          onChange={setShortcuts}
        />
      </PanelSection>

      <PanelSection title="Réglages par défaut">
        <div className="py-3">
          <button
            type="button"
            className="btn-line min-h-11 py-2 text-sm"
            disabled={allDefault}
            onClick={() => {
              s.restoreDefaults();
              setShortcuts(true);
              stopSpeaking();
              setStatus('Réglages par défaut rétablis. Vos réponses n’ont pas été touchées.');
            }}
          >
            Rétablir les réglages par défaut
          </button>
          <p className="mt-2 text-sm text-ink-3" role="status">
            {status || (allDefault ? 'Vous utilisez les réglages par défaut.' : 'Vos réponses ne sont pas touchées.')}
          </p>
          <details className="mt-3 text-sm">
            <summary className="link min-h-10 cursor-pointer py-2 text-ink-2">Voir les réglages par défaut</summary>
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-ink-2">
              {SETTING_DESCRIPTIONS.map((d) => (
                <div key={d.label} className="contents">
                  <dt className="text-ink">{d.label}</dt>
                  <dd>{d.value(DEFAULT_SETTINGS)}</dd>
                </div>
              ))}
              <div className="contents">
                <dt className="text-ink">Raccourcis clavier</dt>
                <dd>activés</dd>
              </div>
            </dl>
          </details>
        </div>
      </PanelSection>
    </div>
  );
}
