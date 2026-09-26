#!/usr/bin/env python3
"""
Bruitages et musique de Cartes sur Table.

Les bruitages partent de la bibliothèque Mixkit (licence libre, usage commercial autorisé) rangée
dans un dossier local (par défaut D:/montage-assets), retravaillés et complétés par synthèse.
La musique « Délibération » est une composition originale, en do majeur comme les bruitages :
valse lente dans l'esprit des Gymnopédies, piano feutré synthétisé, boîte à musique échantillonnée
sur le carillon de la bibliothèque, réverbération. Elle boucle sans couture.

Usage : python scripts/sons/composer.py [dossier-bibliotheque]
Nécessite ffmpeg (avec libmp3lame) et numpy. Écrit les fichiers dans src/assets/sons/.
"""
import math
import pathlib
import subprocess
import sys

import numpy as np

SR = 44100
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'src' / 'assets' / 'sons'
LIB = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'D:/montage-assets')
rng = np.random.default_rng(2027)


# ---------------------------------------------------------------- outils


def load(rel):
    """Décode un son de la bibliothèque en mono flottant 44,1 kHz."""
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', str(LIB / rel), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def save(name, x, bitrate='96k'):
    x = np.asarray(x, dtype=np.float64)
    ch = 1 if x.ndim == 1 else x.shape[1]
    OUT.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-',
         '-codec:a', 'libmp3lame', '-b:a', bitrate, str(OUT / f'{name}.mp3')],
        input=np.clip(x, -1, 1).astype(np.float32).tobytes(),
        check=True,
    )


def n_(s):
    return int(round(s * SR))


def tt(n):
    return np.arange(n) / SR


def fades(x, a=0.002, r=0.02):
    """Fondus en cosinus au début et à la fin (évite les clics)."""
    x = np.array(x, dtype=np.float64)
    na, nr = min(n_(a), len(x)), min(n_(r), len(x))
    if na:
        x[:na] *= 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, na))
    if nr:
        x[-nr:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, nr))
    return x


def spectral(x, gain):
    """Filtre à phase nulle appliqué dans le domaine fréquentiel."""
    n = len(x)
    size = 1 << (n + 8192 - 1).bit_length()
    f = np.fft.rfftfreq(size, 1 / SR)
    return np.fft.irfft(np.fft.rfft(x, size) * gain(f), size)[:n]


def lowpass(x, fc, order=2):
    return spectral(x, lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * order)))


def highpass(x, fc, order=2):
    return spectral(x, lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-6)) ** (2 * order)))


def bandpass(x, lo, hi, order=2):
    return highpass(lowpass(x, hi, order), lo, order)


def resample(x, ratio):
    """Transpose par rééchantillonnage (ratio > 1 : plus aigu et plus court)."""
    if ratio > 1:
        x = lowpass(x, 0.45 * SR / ratio, 4)
    m = int(len(x) / ratio)
    return np.interp(np.arange(m) * ratio, np.arange(len(x)), x)


def onset(x, thr=0.08):
    return int(np.argmax(np.abs(x) > thr * np.abs(x).max()))


def peak_db(x, db):
    return x * (10 ** (db / 20) / (np.abs(x).max() + 1e-12))


def mix(length, *parts):
    """Additionne des (décalage en s, signal) dans un tampon mono."""
    out = np.zeros(n_(length))
    for at, sig in parts:
        i = n_(at)
        j = min(len(out), i + len(sig))
        out[i:j] += sig[: j - i]
    return out


def noise(n):
    return rng.standard_normal(n)


def decay(n, tau):
    return np.exp(-tt(n) / tau)


# ---------------------------------------------------------------- matières premières

click = load('sfx/click/click-275.mp3')
click = click[max(0, onset(click) - 40):][: n_(0.05)]
click = fades(click, 0.0005, 0.015)

ding = load('sfx/notification/notification-2870.mp3')  # carillon clair en do6 (≈ 1049 Hz)
ding = ding[max(0, onset(ding) - 30):][: n_(1.95)]
ding = fades(ding, 0.001, 0.35)
DING_HZ = 1049.0

whoosh = load('sfx/whoosh/whoosh-1491.mp3')
arpege = load('sfx/win/win-600.mp3')  # arpège de do majeur


def ding_at(hz, dur=None):
    x = resample(ding, hz / DING_HZ)
    if dur:
        x = fades(x[: n_(dur)], 0.001, min(0.3, dur / 3))
    return x


# ---------------------------------------------------------------- bruitages


def tampon():
    """Coup de tampon encreur : frappe, corps sourd, claquement de papier."""
    n = n_(0.22)
    t = tt(n)
    phase = 2 * np.pi * np.cumsum(120 + 110 * np.exp(-t / 0.015)) / SR  # 230 -> 120 Hz
    corps = (np.sin(phase) + 0.35 * np.sin(2 * phase)) * decay(n, 0.035)
    bois = bandpass(noise(n), 300, 1600) * decay(n, 0.016)
    papier = highpass(noise(n), 2400) * decay(n, 0.008)
    x = 0.8 * corps + 0.7 * bois / np.abs(bois).max() + 0.18 * papier / np.abs(papier).max()
    x[: len(click)] += 0.35 * lowpass(click, 4500) / np.abs(click).max()
    return peak_db(fades(highpass(x, 90), 0.0005, 0.05), -3)


def glisse():
    """La carte part : souffle court, pris au cœur d'un « whoosh » de la bibliothèque."""
    env = np.convolve(np.abs(whoosh), np.ones(512) / 512, 'same')
    p = int(np.argmax(env))
    x = whoosh[max(0, p - n_(0.30)): p + n_(0.24)]
    x = highpass(resample(x, 1.25), 160)
    return peak_db(fades(x, 0.06, 0.12), -8)


def retour():
    """Carte précédente : le souffle à l'envers, un peu plus grave."""
    x = resample(glisse()[::-1], 0.9)
    return peak_db(fades(x, 0.02, 0.05), -10)


def carte():
    """Une nouvelle carte glisse sur la table puis se pose."""
    air = highpass(resample(whoosh[n_(0.35): n_(0.75)], 2.2), 1400)
    air = fades(air, 0.01, 0.06)
    n = n_(0.03)
    pose = bandpass(noise(n), 220, 1200) * decay(n, 0.006)
    x = mix(0.26, (0, 0.8 * air / np.abs(air).max()), (0.13, 0.45 * pose / np.abs(pose).max()))
    return peak_db(fades(x, 0.003, 0.04), -14)


def onglet():
    """Page que l'on tourne : froissement très bref."""
    n = n_(0.07)
    x = bandpass(noise(n), 2600, 8500) * (1 - np.exp(-tt(n) / 0.004)) * decay(n, 0.016)
    return peak_db(fades(x, 0.001, 0.02), -17)


def deverrouille():
    """Le vote s'ouvre : déclic, puis deux notes montantes (do, sol)."""
    x = mix(
        1.5,
        (0, 0.5 * resample(click, 1.2) / np.abs(click).max()),
        (0.04, 0.8 * ding_at(1046.5, 1.2)),
        (0.13, 0.6 * ding_at(1568.0, 1.3)),
    )
    return peak_db(fades(x, 0.001, 0.25), -9)


def verrou():
    """Vote encore verrouillé : deux petits coups de bois, « toc toc »."""
    def toc(f0):
        n = n_(0.12)
        t = tt(n)
        body = (np.sin(2 * np.pi * f0 * t) + 0.45 * np.sin(2 * np.pi * f0 * 2.53 * t)) * decay(n, 0.028)
        frappe = bandpass(noise(n), 400, 2600) * decay(n, 0.004)
        return body + 0.35 * frappe / np.abs(frappe).max()

    x = mix(0.3, (0, toc(247)), (0.115, 0.85 * toc(220)))
    return peak_db(fades(x, 0.0005, 0.05), -9)


def signet():
    """Signet « important pour moi » : petit déclic sec."""
    x = lowpass(click, 6500)
    return peak_db(fades(x, 0.0003, 0.02), -12)


def palier():
    """Nouveau palier de résultats : l'arpège de do majeur de la bibliothèque, raccourci."""
    x = arpege[max(0, onset(arpege) - 40):][: n_(1.9)]
    return peak_db(fades(x, 0.001, 0.6), -9)


def revelation():
    """On retourne les cartes : un paquet qui s'effeuille, puis un carillon."""
    parts = []
    at = 0.0
    for i in range(7):
        k = onglet() * (0.7 + 0.3 * rng.random())
        parts.append((at, resample(k, 0.9 + 0.2 * rng.random())))
        at += 0.075 - 0.006 * i
    parts.append((at + 0.06, 0.7 * ding_at(1046.5, 1.4)))
    x = mix(at + 1.6, *parts)
    return peak_db(fades(x, 0.001, 0.4), -10)


# ---------------------------------------------------------------- musique

BPM = 64
BEAT = 60 / BPM
BAR = 3 * BEAT
BARS = 32
LOOP = BARS * BAR  # 90 s
TAIL = 7.0


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def piano(m, dur, vel):
    """Piano feutré : partiels légèrement inharmoniques, cordes doublées, étouffoir."""
    f0 = midi_hz(m)
    rel = 0.4
    n = n_(dur + rel + 0.05)
    t = tt(n)
    x = np.zeros(n)
    B = min(0.0015, 0.00007 * (f0 / 65.0) ** 1.1)
    tau1 = float(np.interp(math.log2(f0), [math.log2(55), math.log2(1760)], [7.5, 1.4]))
    soft = 0.55 + 0.45 * vel
    for k in range(1, 19):
        fk = k * f0 * math.sqrt(1 + B * k * k)
        if fk > 12000:
            break
        amp = (1 / k ** 1.25) * math.exp(-(k - 1) * (0.34 - 0.24 * soft))
        tauk = tau1 / (1 + 0.55 * (k - 1))
        env = 0.62 * np.exp(-t / (0.28 * tauk)) + 0.38 * np.exp(-t / (1.6 * tauk))
        cents = 0.7 if k <= 6 else 0.0
        d = 2 ** (cents / 1200)
        ph = rng.random(2) * 2 * np.pi
        x += amp * env * 0.5 * (np.sin(2 * np.pi * fk * d * t + ph[0]) + np.sin(2 * np.pi * fk / d * t + ph[1]))
    atk = n_(0.006)
    x[:atk] *= np.linspace(0, 1, atk) ** 1.5
    marteau = lowpass(noise(n_(0.03)), 1400) * decay(n_(0.03), 0.006)
    x[: len(marteau)] += 0.015 * marteau
    off = n_(dur)
    x[off:] *= np.exp(-tt(n - off) / 0.13)
    return fades(x * vel, 0.0, 0.03)


def boite(m, vel):
    """Boîte à musique : le carillon de la bibliothèque, transposé."""
    x = resample(ding, midi_hz(m) / DING_HZ)
    return x * vel


def nappe(ms, dur, vel):
    """Nappe très douce (cordes lointaines) : partiels impairs et pairs désaccordés, attaque lente."""
    n = n_(dur + 1.5)
    t = tt(n)
    x = np.zeros(n)
    for m in ms:
        f0 = midi_hz(m)
        for k in range(1, 7):
            for c in (-4, 4):
                x += (1 / k ** 1.3) * np.sin(2 * np.pi * f0 * k * 2 ** (c / 1200) * t + rng.random() * 6.283)
    env = np.clip(t / 1.6, 0, 1) ** 2 * np.clip((dur + 1.5 - t) / 1.5, 0, 1) ** 2
    return lowpass(x * env, 1300) * vel / len(ms)


def impulse(dur=3.2, rt=2.6):
    """Réponse impulsionnelle stéréo d'une salle douce, de plus en plus sombre."""
    n = n_(dur)
    t = tt(n)
    chans = []
    for _ in range(2):
        clair = lowpass(noise(n), 7000)
        sombre = lowpass(noise(n), 1600)
        w = np.clip(t / dur, 0, 1) ** 0.6
        ir = (clair * (1 - w) + sombre * w) * np.exp(-t * 6.91 / rt)
        ir[: n_(0.012)] = 0
        for d, g in ((0.013, 0.5), (0.021, 0.35), (0.034, 0.3), (0.047, 0.22)):
            ir[n_(d + 0.002 * rng.random())] += g * (1 if rng.random() > 0.5 else -1)
        chans.append(ir)
    ir = np.stack(chans, 1)
    return ir / np.sqrt((ir ** 2).sum(0)).max()


def circular(sig, length):
    """Replie la queue sur le début : la boucle se referme sans couture."""
    out = sig[:length].copy()
    rest = sig[length:]
    while len(rest):
        k = min(len(rest), length)
        out[:k] += rest[:k]
        rest = rest[k:]
    return out


def reverb(x, ir):
    size = 1 << (len(x) + len(ir[:, 0])).bit_length()
    X = np.fft.rfft(x, size)
    return np.stack([np.fft.irfft(X * np.fft.rfft(ir[:, c], size), size)[: len(x) + len(ir) - 1] for c in (0, 1)], 1)


# Accords : (basse, [voix]). Do majeur, couleurs de septième majeure.
CH = {
    'C': (36, [52, 55, 59, 64]),
    'F': (41, [57, 60, 64]),
    'Am': (45, [55, 60, 64]),
    'Em': (40, [55, 59, 62]),
    'Dm': (38, [53, 57, 60]),
    'G': (43, [53, 60, 62]),
    'C/E': (40, [55, 59, 60]),
    'Bb': (34, [53, 57, 62]),
}
PROG = (
    ['C', 'F', 'C', 'F', 'Am', 'Em', 'F', 'G']
    + ['C', 'F', 'C', 'F', 'Am', 'Dm', 'F', 'C']
    + ['Am', 'Em', 'F', 'C/E', 'Dm', 'Am', 'Bb', 'G']
    + ['C', 'F', 'C', 'F', 'Am', 'Dm', 'F', 'G']
)
# Mélodie : (mesure 1-32, temps 1-3, note MIDI, durée en temps).
C5, D5, E5, F5, G5, A5, B5, C6, D6, E6 = 72, 74, 76, 77, 79, 81, 83, 84, 86, 88
MEL = [
    (1, 2, E5, 1), (1, 3, G5, 1), (2, 1, A5, 3),
    (3, 2, G5, 1), (3, 3, B5, 1), (4, 1, C6, 2), (4, 3, A5, 1),
    (5, 1, E5, 3), (6, 2, D5, 1), (6, 3, E5, 1), (7, 1, G5, 2), (7, 3, A5, 1), (8, 1, G5, 3),
    (9, 2, E5, 1), (9, 3, G5, 1), (10, 1, A5, 2), (10, 3, C6, 1), (11, 1, B5, 3),
    (12, 2, A5, 1), (12, 3, C6, 1), (13, 1, E6, 2), (13, 3, D6, 1), (14, 1, C6, 3),
    (15, 1, A5, 2), (15, 3, G5, 1), (16, 1, E5, 3),
    (17, 2, C6, 1), (17, 3, B5, 1), (18, 1, G5, 3), (19, 2, A5, 1), (19, 3, C6, 1),
    (20, 1, E6, 2), (20, 3, D6, 1), (21, 1, D6, 2), (21, 3, C6, 1), (22, 1, A5, 3),
    (23, 2, D6, 1), (23, 3, C6, 1), (24, 1, D6, 3),
    (25, 2, E5, 1), (25, 3, G5, 1), (26, 1, A5, 3), (27, 2, G5, 1), (27, 3, B5, 1),
    (28, 1, A5, 2), (28, 3, G5, 1), (29, 1, E5, 3), (30, 2, F5, 1), (30, 3, E5, 1), (31, 1, D5, 3),
]


def pan(sig, p):
    """Panoramique à puissance constante, p de -1 (gauche) à 1 (droite)."""
    a = (p + 1) * math.pi / 4
    return np.stack([sig * math.cos(a), sig * math.sin(a)], 1)


def musique():
    total = n_(LOOP + TAIL)
    dry = np.zeros((total, 2))
    send = np.zeros(total)  # départ réverbération (mono)

    def put(sig, at, p, wet):
        i = n_(max(0.0, at))
        j = min(total, i + len(sig))
        st = pan(sig[: j - i], p)
        dry[i:j] += st
        send[i:j] += sig[: j - i] * wet

    human = lambda s: s + rng.normal(0, 0.008)  # noqa: E731

    for b, name in enumerate(PROG):
        t0 = b * BAR
        bass, voices = CH[name]
        section = b // 8
        v = 0.5 + 0.06 * rng.random()
        put(piano(bass, 3 * BEAT + 0.3, v * 0.5), human(t0), -0.15, 0.22)
        put(piano(bass + 12, 3 * BEAT + 0.3, v * 0.45), human(t0 + 0.01), -0.1, 0.22)
        for k, m in enumerate(voices):
            vv = 0.3 + 0.05 * rng.random()
            put(piano(m, 2 * BEAT + 0.35, vv), human(t0 + BEAT + 0.018 * k), -0.2 + 0.12 * k, 0.28)
        if section >= 2:  # partie B et reprise : une nappe lointaine porte l'harmonie
            fade_out = b == BARS - 1
            put(nappe([m + 12 for m in voices[:3]], BAR * (0.6 if fade_out else 1.0), 0.028), t0, 0.0, 0.9)

    for bar, beat, m, d in MEL:
        at = human((bar - 1) * BAR + (beat - 1) * BEAT)
        vel = 0.6 + 0.08 * rng.random() + (0.05 if d >= 2 else 0.0)
        put(boite(m, vel), at, 0.28, 0.4)
        if 17 <= bar <= 24:  # partie B : le piano double la mélodie à l'octave inférieure
            put(piano(m - 12, d * BEAT, 0.2), at + 0.004, 0.1, 0.3)

    wet = reverb(send, impulse())
    L = n_(LOOP)
    out = np.stack([circular(dry[:, c], L) for c in (0, 1)], 1)
    out += 0.55 * np.stack([circular(wet[:, c], L) for c in (0, 1)], 1)
    # Égalisation : moins de graves (inaudibles sur un téléphone, fatigants au casque), un peu d'air.
    def tilt(f):
        f = np.maximum(f, 1e-6)
        low = 1 / (1 + (f / 140) ** 2)
        high = (f / 2000) ** 2 / (1 + (f / 2000) ** 2)
        hp = 1 / np.sqrt(1 + (45 / f) ** 4)
        return 10 ** ((-7 * low + 4 * high) / 20) * hp

    out = np.stack([spectral(out[:, c], tilt) for c in (0, 1)], 1)
    # Limiteur doux, puis marge de crête.
    out = np.tanh(out / (np.abs(out).max() * 0.9)) * 0.71  # environ -18 LUFS : une musique de fond
    return out


if __name__ == '__main__':
    for fn in (tampon, glisse, retour, carte, onglet, deverrouille, verrou, signet, palier, revelation):
        save(fn.__name__, fn(), '96k')
        print('bruitage', fn.__name__)
    save('musique-deliberation', musique(), '96k')
    print('musique', f'{LOOP:.1f} s')
