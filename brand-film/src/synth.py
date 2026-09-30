"""Sound design + score for PONTO DE VISTA, synthesised from scratch.
Visual events come from events.json (exported by the renderer), the score is written against the same clock."""
import json, sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000
import os
DUR = float(os.environ.get('DUR', '27.0'))
N = int(DUR * SR)
rs = np.random.default_rng(3)
music = np.zeros((2, N))
sfx = np.zeros((2, N))
verb_send = np.zeros((2, N))


def T(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return rs.standard_normal(int(d * SR))


def filt(x, kind, f, order=2):
    if kind == 'band':
        sos = butter(order, [max(20, f[0]), min(SR / 2 - 100, f[1])], 'bandpass', fs=SR, output='sos')
    else:
        sos = butter(order, min(f, SR / 2 - 100), kind, fs=SR, output='sos')
    return sosfilt(sos, x)


def svf_sweep(x, f_arr, q=2.0, mode='bp'):
    """state-variable filter with per-sample cutoff"""
    y = np.zeros_like(x)
    lp = bp = 0.0
    damp = 1.0 / q
    for i in range(len(x)):
        fc = 2 * np.sin(np.pi * min(f_arr[i], SR / 6) / SR)
        hp = x[i] - lp - damp * bp
        bp += fc * hp
        lp += fc * bp
        y[i] = bp if mode == 'bp' else lp
    return y


def sweep(f0, f1, d, curve='exp'):
    t = T(d)
    k = t / d
    f = f0 * (f1 / f0) ** k if curve == 'exp' else f0 + (f1 - f0) * k
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph), f


def env_ad(n, a, tau):
    t = np.arange(n) / SR
    e = np.exp(-t / tau)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


def add(bus, x, t0, gain=1.0, pan=0.0, send=0.0):
    if x.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
        r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        x = np.stack([x * l, x * r])
    i0 = int(round(t0 * SR))
    if i0 < 0:
        x = x[:, -i0:]
        i0 = 0
    n = min(x.shape[1], N - i0)
    if n <= 0:
        return
    bus[:, i0:i0 + n] += gain * x[:, :n]
    if send:
        verb_send[:, i0:i0 + n] += gain * send * x[:, :n]


def note_hz(n):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    nm, octv = n[:-1], int(n[-1])
    return 440.0 * 2 ** ((names[nm] + 12 * (octv + 1) - 69) / 12)


# ---------------- instruments ----------------
def marimba(f, d=1.4, bright=1.0):
    t = T(d)
    y = np.zeros_like(t)
    for r, a, tau in [(1, 1, 0.55), (3.93, 0.28 * bright, 0.12), (9.2, 0.08 * bright, 0.04)]:
        if f * r < SR / 2.5:
            y += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (tau * (330 / f) ** 0.35))
    y[:48] *= np.linspace(0, 1, 48)
    m = filt(noise(0.006), 'band', (1500, 6000)) * 0.08
    y[:len(m)] += m
    return y


def epiano(f, d=3.0, idx=1.6, tau=1.4):
    t = T(d)
    mod = idx * np.exp(-t / 0.25) * np.sin(2 * np.pi * f * t)
    y = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / tau)
    y += 0.15 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.3)
    y[:96] *= np.linspace(0, 1, 96)
    return y


def bell(f, d=3.0):
    t = T(d)
    mod = 1.2 * np.exp(-t / 0.6) * np.sin(2 * np.pi * f * 3.5 * t)
    y = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / 1.1)
    y[:96] *= np.linspace(0, 1, 96)
    return y


def pad(freqs, d, a=0.9, r=1.5):
    t = T(d)
    L = np.zeros_like(t)
    R = np.zeros_like(t)
    for f in freqs:
        for n in range(1, 6):
            amp = 1 / n ** 1.6
            det = 2 ** (1.2 / 1200)
            vib = 1 + 0.0006 * np.sin(2 * np.pi * (0.25 + 0.05 * n) * t)
            L += amp * np.sin(2 * np.pi * f * n * t * vib * det)
            R += amp * np.sin(2 * np.pi * f * n * t * vib / det + 0.7)
    e = np.minimum(1, t / a) * np.minimum(1, np.maximum(0, (d - t) / r))
    return np.stack([L * e, R * e]) / (len(freqs) * 2.2)


def kick(v=1.0, soft=1.0):
    s, _ = sweep(125, 46, 0.3)
    t = T(0.3)
    y = s * np.exp(-t / (0.12 * soft))
    y[:30] += np.linspace(0.3, 0, 30)
    return filt(y, 'low', 1800) * v


def snap(v=1.0):
    y = filt(noise(0.08), 'band', (1400, 3200)) * env_ad(int(0.08 * SR), 0.001, 0.022)
    y += 0.3 * np.sin(2 * np.pi * 950 * T(0.08)) * env_ad(int(0.08 * SR), 0.0005, 0.008)
    return y * v * 1.4


def shaker(v=1.0):
    y = filt(noise(0.06), 'high', 6000) * env_ad(int(0.06 * SR), 0.006, 0.02)
    return y * v * 0.7


def bass(f, d=1.2, v=1.0):
    t = T(d)
    y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.08 * np.sin(6 * np.pi * f * t)
    y *= env_ad(len(t), 0.006, 0.45)
    y *= np.minimum(1, (d - t) / 0.05).clip(0, 1)
    return filt(y, 'low', 900) * v


def tk(pitch=1.0, v=1.0):
    """round woody click — the sound of a blink"""
    s, _ = sweep(1250 * pitch, 800 * pitch, 0.035)
    y = s * env_ad(len(s), 0.0004, 0.009)
    y += 0.35 * filt(noise(0.035), 'band', (2000 * pitch, 6000)) * env_ad(len(s), 0.0002, 0.003)
    return y * v


def tick(pitch=1.0, v=1.0):
    y = np.sin(2 * np.pi * 3100 * pitch * T(0.02)) * env_ad(int(0.02 * SR), 0.0003, 0.004)
    y += 0.4 * filt(noise(0.02), 'high', 5000) * env_ad(int(0.02 * SR), 0.0002, 0.002)
    return y * v * 0.6


def pop(pitch=1.0, v=1.0):
    s, _ = sweep(1300 * pitch, 380 * pitch, 0.05)
    y = s * env_ad(len(s), 0.0006, 0.018)
    return y * v


def blup(v=1.0):
    s, f = sweep(260, 900, 0.11)
    n = len(s)
    e = np.sin(np.pi * np.arange(n) / n) ** 1.5
    return s * e * v * 0.8


def blep(v=1.0):
    s, _ = sweep(640, 190, 0.075)
    y = s * env_ad(len(s), 0.002, 0.03)
    y += 0.25 * filt(noise(0.075), 'low', 900) * env_ad(len(s), 0.001, 0.012)
    return y * v


def whoosh(d, f0, f1, v=1.0, q=1.6):
    x = noise(d)
    f = f0 * (f1 / f0) ** (T(d) / d)
    y = svf_sweep(x, f, q)
    n = len(y)
    e = np.sin(np.pi * np.arange(n) / n) ** 1.2
    return y * e * v * 0.35


def sniff(v=1.0):
    d = 0.14
    x = noise(d)
    f = np.linspace(2200, 4200, len(x))
    y = svf_sweep(x, f, 1.3)
    n = len(y)
    e = np.minimum(1, np.arange(n) / (0.03 * SR)) * np.exp(-np.maximum(0, np.arange(n) - 0.03 * SR) / (0.045 * SR))
    return y * e * v * 0.55


def thump(f0=120, f1=55, d=0.25, v=1.0):
    s, _ = sweep(f0, f1, d)
    y = s * env_ad(len(s), 0.002, d / 3)
    y += 0.2 * filt(noise(d), 'low', 500) * env_ad(len(s), 0.001, 0.02)
    return y * v


def felt(f, v=1.0):
    t = T(0.6)
    y = (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)) * env_ad(len(t), 0.004, 0.14)
    return filt(y, 'low', 1600) * v


def marker(d, v=1.0):
    x = noise(d)
    y = filt(x, 'band', (2500, 6500))
    jit = np.repeat(rs.uniform(0.3, 1.0, int(d * 200) + 1), SR // 200)[:len(y)]
    n = len(y)
    e = np.minimum(1, np.arange(n) / (0.02 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.04 * SR))
    return y * jit * e * v * 0.18


def paper(d=0.35, v=1.0):
    x = filt(noise(d), 'band', (400, 5000))
    crack = (rs.random(len(x)) > 0.9985) * rs.uniform(-1, 1, len(x))
    crack = filt(crack, 'high', 2500) * 3
    n = len(x)
    e = np.sin(np.pi * np.arange(n) / n) ** 0.8
    return (x * 0.25 + crack * 0.4) * e * v


def breath(d=0.7, v=1.0):
    x = filt(noise(d), 'band', (500, 2600))
    n = len(x)
    e = np.minimum(1, np.arange(n) / (0.45 * n)) ** 1.5 * np.minimum(1, (n - np.arange(n)) / (0.25 * n))
    return x * e * v * 0.12


def shimmer(d=0.8, base=1760, v=1.0):
    t = T(d)
    y = sum(np.sin(2 * np.pi * base * r * t + r) for r in (1, 1.5, 2, 3))
    e = np.sin(np.pi * t / d) ** 2
    return y * e * v * 0.04


