"""Score + sound design for the 1-minute version. Same instruments as the 27 s film (synth.py);
each encounter gets its own musical temperament."""
import os
os.environ.setdefault('DUR', '56.0')
from synth import *

beat = 0.5
m = lambda x, t0, g=1.0, pan=0.0, send=0.25: add(music, x, t0, g, pan, send)
H_ = note_hz


def chord_stab(t0, notes, g=0.16, idx=1.4, tau=0.9, d=2.0):
    for j, n in enumerate(notes):
        m(epiano(H_(n), d, idx, tau), t0 + j * 0.006, g, -0.3 + 0.2 * j, 0.45)


def groove_bar(t0, root, arp, lvl=2, snap_on=True, g=1.0):
    for k in range(4):
        tb = t0 + k * beat
        m(kick(0.75), tb, g, 0, 0.03)
        if k % 2 == 1 and snap_on:
            m(snap(0.7), tb, 0.8 * g, 0.15, 0.35)
    for k in range(16):
        m(shaker(1.0 if k % 2 == 0 else 0.6), t0 + k * 0.125 + (0.012 if k % 2 else 0), (0.4 + 0.08 * lvl) * g, 0.5)
    for off, mul in [(0, 1), (0.375, 1.5), (0.75, 1), (1.0, 1), (1.375, 1.5), (1.75, 2)]:
        m(bass(H_(root) * mul, 0.3, 0.7), t0 + off, g)
    if lvl >= 1:
        for k in range(16):
            m(marimba(H_(arp[k % 4]), 0.5, 0.8), t0 + k * 0.125, (0.14 + 0.025 * lvl) * g, -0.4 if k % 2 else 0.4, 0.3)


# ---- A · 3/4 waltz (2.5 – 8.5): repara / escuta / sente / língua
waltz = [('D2', ['D4', 'F#4', 'A4']), ('B1', ['B3', 'D4', 'F#4']), ('G1', ['G3', 'B3', 'D4']), ('A1', ['A3', 'C#4', 'E4'])]
for bi, (root, chord) in enumerate(waltz):
    t0 = 2.5 + bi * 1.5
    m(kick(0.55), t0, 1.0, 0, 0.05)
    m(bass(H_(root), 1.4, 0.55), t0, 1.0, 0, 0.05)
    for k in (1, 2):
        if bi == 3 and k == 2:
            continue
        for j, n in enumerate(chord):
            m(marimba(H_(n), 0.5, 0.6), t0 + k * beat + j * 0.004, 0.12, -0.3 + 0.3 * j, 0.3)
    if bi >= 1:
        for k in range(6):
            m(shaker(0.5 if k % 2 else 0.8), t0 + k * 0.25, 0.35, 0.4)
s, _ = sweep(H_('A1'), H_('D2'), 0.35)
m(s * env_ad(len(s), 0.01, 0.3) * 0.25, 8.1, 1.0)

# ---- E1 · espera. (8.5 – 13.5): space, patience, a tender resolution
m(pad([H_(n) for n in ['D3', 'A3', 'F#4']], 5.0, 1.6, 1.2), 8.45, 0.32, 0, 0.5)
for t0, n, g in [(9.0, 'A5', 0.12), (9.5, 'F#5', 0.1), (10.7, 'E5', 0.08), (11.2, 'D5', 0.09)]:
    m(marimba(H_(n), 0.9, 0.7), t0, g, 0.3, 0.5)
# creeping closer: three rising notes, then the trust chord on the shared slow blink
for j, n in enumerate(['D5', 'E5', 'F#5']):
    m(marimba(H_(n), 0.8, 0.8), 11.6 + j * 0.2, 0.1 + 0.02 * j, -0.2 + 0.2 * j, 0.5)
chord_stab(12.2, ['D3', 'A3', 'E4', 'F#4', 'A4'], 0.1, 1.0, 1.4, 2.4)
m(bell(H_('A5'), 2.0), 12.22, 0.05, 0.2, 0.7)

# ---- E2 · acalma. (13.5 – 18.5): a nervous tremolo that slows down into a breath
t, nt = 13.55, 0
while t < 17.2:
    calm = np.clip((t - 14.6) / 2.6, 0, 1)
    rate = 16 * (1 - calm) + 2.2 * calm
    pitch = ['F#5', 'G5'][nt % 2] if calm < 0.6 else ['D5', 'A4'][nt % 2]
    g = 0.07 * (1 - 0.4 * calm)
    m(marimba(H_(pitch) * (1 + 0.004 * np.sin(nt)), 0.25 + 0.6 * calm, 0.9), t, g, 0.4 * np.sin(nt * 1.3), 0.3)
    t += 1.0 / rate
    nt += 1
for k in range(16):   # nervous ticking that fades
    tt = 13.6 + k * 0.125
    m(tick(1.3, 0.6), tt, 0.25 * (1 - k / 16), -0.5, 0.05)
m(pad([H_(n) for n in ['B2', 'F#3', 'D4', 'A4']], 3.2, 1.4, 1.4), 15.3, 0.3, 0, 0.5)
chord_stab(17.6, ['G2', 'D3', 'B3', 'F#4', 'A4'], 0.1, 0.9, 1.6, 2.2)

# ---- E3 · brinca. (18.5 – 23.5): bouncy and bright, the groove comes back
for k in range(4):
    m(snap(0.5), 18.5 + 0.5 + k * 0.5, 0.35, 0.3, 0.3)
m(bass(H_('D2'), 0.4, 0.6), 20.0, 1.0)
for k in range(6):
    tb = 20.25 + k * 0.25
    m(kick(0.55), tb, 1.0, 0, 0.03)
    m(shaker(0.9), tb + 0.125, 0.4, 0.4)
    m(bass(H_(['D2', 'F#2', 'A2', 'B2', 'A2', 'F#2'][k]), 0.22, 0.6), tb, 1.0)
chord_stab(22.25, ['D4', 'F#4', 'A4', 'D5'], 0.08, 1.2, 0.6, 1.2)
groove_bar(22.5, 'D2', ['D5', 'A4', 'F#5', 'A4'], 1, True, 0.7)

# ---- G · JEITO grid (23.5 – 31.5)
# one continuous 4/4 groove; the grid cuts (every 3 beats) ride across it and every bar adds a layer
for bi, (root, arp) in enumerate([('D2', ['D5', 'A4', 'F#5', 'A4']), ('B1', ['D5', 'B4', 'F#5', 'B4']), ('G1', ['D5', 'B4', 'G5', 'B4'])]):
    groove_bar(23.5 + bi * 2.0, root, arp, 1 + bi)
# last half bar (29.5 – 30.5) before the unison stop
for k in range(2):
    m(kick(0.8), 29.5 + k * 0.5, 1.0, 0, 0.03)
m(snap(0.8), 30.0, 0.9, 0.15, 0.35)
for k in range(8):
    m(shaker(1.0), 29.5 + k * 0.125, 0.7, 0.5)
    m(marimba(H_(['E5', 'C#5', 'A5', 'C#5'][k % 4]), 0.5, 0.8), 29.5 + k * 0.125, 0.22, -0.4 if k % 2 else 0.4, 0.3)
m(bass(H_('A1'), 0.9, 0.7), 29.5, 1.0)
m(whoosh(0.9, 400, 7000, 0.6), 29.6, 0.8)
m(thump(90, 40, 0.5, 1.0), 30.5, 0.9)
for n in ['D3', 'A3', 'F#4', 'E5']:
    m(epiano(H_(n), 1.2, 1.0, 0.5), 30.5, 0.14, 0, 0.4)

# ---- M · MUNDO (31.5 – 40.5)
cbus = np.zeros((2, N))
for i in range(3):
    t0 = 31.5 + i * 0.5
    add(cbus, kick(0.7), t0)
    add(cbus, bass(H_(['D2', 'D2', 'G1'][i]), 0.45, 0.7), t0)
    for k in range(4):
        add(cbus, marimba(H_(['A4', 'D5', 'F#5', 'D5'][k]), 0.4), t0 + k * 0.125, 0.2)
for ch in range(2):
    cbus[ch] = filt(cbus[ch], 'low', 750)
music += cbus
# stamps: the groove opens up, each stamp is a downbeat
for k in range(8):
    tb = 32.9 + 0.1 + k * 0.25
    m(shaker(0.8), tb, 0.35, 0.4)
for t0, root in [(33.0, 'D2'), (33.5, 'B1'), (34.0, 'G1'), (34.45, 'A1')]:
    m(bass(H_(root), 0.45, 0.7), t0, 1.0)
cbus = np.zeros((2, N))
for i in range(3):
    t0 = 34.9 + i * 0.4
    add(cbus, kick(0.6), t0)
    for k in range(4):
        add(cbus, marimba(H_(['D5', 'F#5', 'A5', 'F#5'][k]), 0.4), t0 + k * 0.1, 0.18)
for ch in range(2):
    cbus[ch] = filt(cbus[ch], 'low', 1100)
music += cbus
for k in range(12):
    m(shaker(0.9), 36.1 + k * 0.125, 0.35, 0.5)
m(bass(H_('G1'), 0.8, 0.6), 36.1, 1.0)
m(bass(H_('A1'), 0.8, 0.6), 36.8, 1.0)
# keep the pulse alive under the sage sheet and whip into the poster wall
for k in range(2):
    m(kick(0.65), 37.5 + k * 0.5, 1.0, 0, 0.03)
    m(snap(0.5), 37.75 + k * 0.5, 0.5, 0.2, 0.3)
for k in range(8):
    m(shaker(0.9), 37.5 + k * 0.125, 0.4, 0.5)
m(bass(H_('A1'), 0.9, 0.65), 37.5, 1.0)
for j, n in enumerate(['A4', 'C#5', 'E5', 'A5']):
    m(marimba(H_(n), 0.4, 0.9), 38.0 + j * 0.125, 0.14, -0.3 + 0.2 * j, 0.3)
groove_bar(38.5, 'D2', ['D5', 'A4', 'F#5', 'A5'], 3)
m(whoosh(0.5, 500, 6000, 0.5), 40.0, 0.7)

# ---- C · cuidar com jeito. (40.5 – 43.0)
m(kick(1.0, 1.4), 40.5, 1.0, 0, 0.1)
m(bass(H_('D2'), 0.9, 0.8), 40.5, 1.0)
chord_stab(40.5, ['D3', 'A3', 'E4', 'F#4', 'C#5'])
m(bass(H_('B1'), 0.45, 0.6), 41.0, 1.0)
chord_stab(41.0, ['B2', 'F#3', 'D4', 'A4'], 0.1)
m(bass(H_('G1'), 0.9, 0.6), 41.5, 1.0)
chord_stab(41.5, ['G2', 'D3', 'B3', 'F#4', 'A4'], 0.12)
for k in range(4):
    m(shaker(0.6), 41.5 + k * 0.25, 0.3, 0.4)

# ---- despedida (43.0 – 45.0): quiet, fond
m(pad([H_(n) for n in ['D3', 'A3', 'E4', 'F#4']], 2.2, 0.5, 1.0), 43.0, 0.22, 0, 0.6)
m(bell(H_('F#5'), 2.0), 43.75, 0.05, -0.2, 0.7)

# ---- construção (45.0 – 48.0)
B0 = 45.0
build_chords = [(0.0, 'D2', ['D4', 'A4']), (1.0, 'E2', ['E4', 'B4']), (2.0, 'F#2', ['F#4', 'C#5']), (2.5, 'G2', ['G4', 'D5'])]
for i in range(6):
    m(kick(0.45 + 0.08 * i, 1.0), B0 + i * 0.5, 1.0, 0, 0.05)
for (dt, root, top) in build_chords:
    t0 = B0 + dt
    d = 1.0 if dt < 2.0 else 0.5
    m(bass(H_(root), d, 0.5), t0, 1.0)
    for k in range(int(d / 0.125)):
        tt = t0 + k * 0.125
        g = 0.07 + 0.12 * (tt - B0) / 3
        m(marimba(H_(top[k % 2]) * (2 if k % 4 == 3 else 1), 0.35, 0.9), tt, g, -0.5 if k % 2 else 0.5, 0.35)
m(whoosh(0.5, 300, 7000, 0.5, 2.5), B0 + 2.5, 0.9)
s, _ = sweep(220, 880, 0.5)
m(s * np.linspace(0, 1, len(s)) ** 2 * 0.06, B0 + 2.5, 1.0)

# ---- the sonic logo on the wink (48.5)
WK = 48.5
m(thump(70, 38, 0.9, 1.0), WK, 1.0, 0, 0.05)
m(marimba(H_('A5'), 1.2, 1.2), WK, 0.34, -0.2, 0.5)
m(marimba(H_('D6'), 1.6, 1.2), WK + 0.11, 0.34, 0.2, 0.6)
m(bell(H_('F#6'), 3.0), WK + 0.11, 0.07, 0.3, 0.8)
for j, n in enumerate(['D3', 'A3', 'E4', 'F#4', 'A4', 'C#5']):
    m(epiano(H_(n), 5.0, 1.1, 2.4), WK + 0.12 + j * 0.012, 0.11, -0.4 + 0.16 * j, 0.6)
m(pad([H_(n) for n in ['D3', 'A3', 'F#4', 'E4']], 7.4, 1.2, 3.2), WK + 0.1, 0.5, 0, 0.5)
m(bass(H_('D2'), 3.0, 0.6), WK, 1.0)
# a last warm note for the peeking friend
m(marimba(H_('F#5'), 1.0, 0.8), 53.35, 0.1, -0.5, 0.6)

# ---------------- sound effects from the visual events ----------------
events = json.load(open(os.environ.get('EV', 'ev60v.json')))
groups = {}
for e in events:
    if 'grid' in e:
        groups.setdefault((e['type'], round(e['t'] / 0.02)), []).append(e)
    else:
        groups[(e['type'], e['t'], id(e))] = [e]
LETTER_NOTES = ['A4', 'B4', 'D5', 'E5', 'F#5', 'A5']
PLANT_NOTES = ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6']
SOFT_NOTES = ['D5', 'F#5', 'A5', 'B5', 'A5', 'F#5']
for key, evs in groups.items():
    e = evs[0]
    t = e['t']; ty = e['type']; v = e.get('v', 1.0)
    pan = float(np.mean([x.get('pan', 0) for x in evs]))
    if 'grid' in e:
        v = v * min(1.4, 0.6 + 0.2 * len(evs))
    s = lambda x, g=1.0, send=0.15, p=pan: add(sfx, x, t, g * v, p, send)
    if ty == 'bigblink':
        s(thump(160, 70, 0.22, 0.9), 0.9); s(whoosh(0.16, 1800, 500, 0.8, 1.2), 0.6)
        add(sfx, tk(0.55, 0.6), t + 0.16, 1.0, 0, 0.2)
    elif ty == 'zoomout':
        if t < 3:
            s(whoosh(0.42, 3500, 420, 1.0, 1.4), 1.0, 0.2)
            sw, _ = sweep(900, 260, 0.42); s(sw * np.sin(np.pi * np.arange(len(sw)) / len(sw)) * 0.05)
        else:
            s(whoosh(0.5, 1800, 500, 0.5, 1.2), 1.0, 0.2)
    elif ty == 'zoomin':
        s(whoosh(0.45, 500, 1800, 0.45, 1.2), 1.0, 0.2)
    elif ty in ('land', 'land2'):
        s(tk(0.8, 0.8), 1.0, 0.2)
        if ty == 'land2': s(thump(130, 60, 0.18, 0.4))
    elif ty == 'tick':
        s(tick(1.0 + 0.1 * pan, 0.9), 1.0, 0.1)
    elif ty == 'blink':
        s(tk(1.0, 0.8), 1.0, 0.2)
    elif ty == 'hop':
        s(blup(0.9), 1.0, 0.2)
    elif ty == 'letter':
        s(marimba(H_(LETTER_NOTES[e['i']]), 0.8, 1.1), 0.3, 0.35); s(tick(1.4, 0.4), 1.0, 0.1)
    elif ty == 'swing':
        s(whoosh(0.3, 500, 2200, 1.0, 1.2), 1.0, 0.15)
    elif ty == 'flop':
        s(thump(190, 105, 0.12, 0.7), 1.0, 0.15); s(felt(H_('D3'), 0.4), 1.0, 0.2)
    elif ty == 'ripple':
        for j, n in enumerate(['F#5', 'D5', 'A4']):
            add(sfx, marimba(H_(n), 0.4, 1.0), t + j * 0.03, 0.12 * v, 0.3 - 0.3 * j, 0.3)
    elif ty == 'drop':
        s(whoosh(0.22, 1400, 300, 0.8, 1.2), 1.0, 0.1)
    elif ty == 'thud':
        s(thump(110, 50, 0.3, 0.9), 1.0, 0.1)
    elif ty == 'sniff':
        s(sniff(0.9), 1.0, 0.1)
    elif ty == 'blep':
        s(blep(0.8), 1.0, 0.2)
    elif ty == 'sway':
        s(whoosh(0.6, 300, 900, 0.4, 0.9), 1.0, 0.1)
    elif ty == 'lick':
        x = whoosh(0.45, 500, 5500, 1.2, 1.1); pn = np.linspace(-0.8, 0.8, len(x))
        add(sfx, np.stack([x * np.cos((pn + 1) * np.pi / 4), x * np.sin((pn + 1) * np.pi / 4)]) * 1.4, t, v, 0, 0.2)
    elif ty == 'peek':      # a shy little rising "hm?"
        sw, _ = sweep(700, 1050, 0.09); s(sw * env_ad(len(sw), 0.01, 0.04) * 0.35, 1.0, 0.3); s(tk(1.5, 0.35), 1.0, 0.2)
    elif ty == 'hide':
        s(whoosh(0.16, 2500, 6000, 0.7, 1.4), 1.0, 0.1); sw, _ = sweep(900, 450, 0.08); s(sw * env_ad(len(sw), 0.003, 0.03) * 0.3)
    elif ty == 'rush':
        s(whoosh(0.2, 600, 1800, 0.6, 1.2), 1.0, 0.1)
    elif ty == 'back':
        s(whoosh(0.5, 900, 400, 0.25, 1.0), 1.0, 0.2)
    elif ty == 'creep':
        for j in range(4):
            add(sfx, tick(0.7 + 0.05 * j, 0.35), t + j * 0.15, v, 0.5 - 0.15 * j, 0.2)
    elif ty == 'soft':
        s(felt(H_(SOFT_NOTES[e['i']]) / 2, 0.22), 1.0, 0.4)
    elif ty == 'jitter':
        pass   # the tremolo in the score carries it
    elif ty == 'glide':
        s(whoosh(0.7, 350, 900, 0.3, 0.9), 1.0, 0.3)
    elif ty == 'breath':
        s(breath(e.get('d', 0.75), 1.2), 1.0, 0.35)
    elif ty == 'bounce1':
        i = e.get('i', 0)
        s(pop(1.0 + 0.08 * (i % 5), 0.55), 1.0, 0.2)
    elif ty == 'plant':
        s(marimba(H_(PLANT_NOTES[e['i']]), 0.7, 1.2), 0.3, 0.35); s(pop(0.8, 0.5)); s(thump(150, 80, 0.1, 0.35))
    elif ty == 'tittle':
        s(bell(H_('D6'), 1.5), 0.12, 0.5); s(tk(1.6, 0.6), 1.0, 0.3)
    elif ty == 'cut':
        s(paper(0.12, 0.8), 1.0, 0.05); s(tk(0.5, 0.5))
    elif ty == 'tk':
        s(tk(1.2 if 'grid' in e else 1.35, 0.6), 1.0, 0.15)
    elif ty == 'wood':
        lvl = e.get('grid', 2)
        s(felt(H_(['D3', 'D3', 'F#3', 'A3', 'D4', 'D4', 'F#4'][min(lvl, 6)]), 0.55), 1.0, 0.15)
    elif ty == 'draw':
        s(marker(e.get('d', 0.18), 0.9), 1.0, 0.05)
    elif ty == 'blinkAll':
        for j, p in enumerate([0.7, 0.9, 1.1, 1.35]):
            add(sfx, tk(p, 0.5), t + j * 0.004, v, -0.6 + 0.4 * j, 0.4)
    elif ty == 'paper':
        s(paper(0.35, 0.9), 1.0, 0.1)
    elif ty == 'shimmer':
        s(shimmer(0.7, 1760, 1.0), 1.0, 0.5)
    elif ty == 'flick':
        s(tk(0.45, 0.7))
    elif ty == 'whip':
        s(whoosh(0.35, 800, 7000, 1.1, 1.3), 1.0, 0.1)
    elif ty == 'stamp':    # rubber stamp: a dull thunk + a little squish of ink
        s(thump(140, 55, 0.22, 1.1), 1.0, 0.15); s(filt(noise(0.05), 'band', (300, 1500)) * env_ad(int(0.05 * SR), 0.001, 0.012) * 0.5)
        s(tk(0.4, 0.5))
    elif ty == 'cardland':
        s(paper(0.12, 0.7), 1.0, 0.1); s(thump(200, 120, 0.06, 0.3))
    elif ty == 'swipe':
        s(whoosh(0.18, 900, 3500, 0.6, 1.3), 1.0, 0.1)
    elif ty == 'hit':
        s(thump(100, 45, 0.4, 0.8), 1.0, 0.1)
    elif ty == 'bounce':
        for j in range(3):
            add(sfx, blup(0.35), t + 0.1 + j * 0.06, v, -0.3 + 0.3 * j, 0.2)
            add(sfx, thump(170, 90, 0.08, 0.35), t + 0.14 + j * 0.06, v, -0.3 + 0.3 * j, 0.1)
    elif ty == 'wobble':
        tt = T(0.6)
        x = np.sin(2 * np.pi * 330 * tt + 1.2 * np.sin(2 * np.pi * 7 * tt) * np.exp(-tt / 0.2)) * env_ad(len(tt), 0.005, 0.18)
        s(x * 0.25, 1.0, 0.3)
    elif ty == 'pop':
        s(pop(1.5 if e.get('hi') else 1.0, 0.8), 1.0, 0.25)
    elif ty == 'slowblink':
        s(tk(0.7, 0.55), 1.0, 0.3)
    elif ty == 'wink':
        s(tk(1.15, 1.2), 1.0, 0.35); s(tick(1.2, 0.8), 1.0, 0.2)
    elif ty == 'move':
        s(whoosh(0.6, 250, 1400, 0.45, 1.0), 1.0, 0.2)
    elif ty in ('type1', 'type2'):
        s(felt(H_('D4' if ty == 'type1' else 'A4'), 0.35), 1.0, 0.4)
    elif ty == 'tagline':
        s(shimmer(0.9, 2349, 0.8), 1.0, 0.6)

room = filt(rs.standard_normal(N), 'band', (120, 2500)) * 0.0022
music += np.stack([room, np.roll(room, 997)])
ir_len = int(1.9 * SR)
tt = np.arange(ir_len) / SR
ir = np.stack([rs.standard_normal(ir_len), rs.standard_normal(ir_len)]) * np.exp(-tt / 0.45)
for ch in range(2):
    ir[ch] = filt(ir[ch], 'low', 5200)
ir[:, :int(0.012 * SR)] = 0
ir /= np.abs(ir).sum(axis=1, keepdims=True) ** 0.5 * 12
wet = np.stack([fftconvolve(verb_send[c], ir[c])[:N] for c in range(2)])
mix = music * 0.62 + sfx * 1.1 + wet * 0.85
for ch in range(2):
    mix[ch] = filt(mix[ch], 'high', 28)
mix = mix / (np.abs(mix).max() + 1e-9) * 1.6
mix = np.tanh(mix) / np.tanh(1.6)
print('rms dBFS', 20 * np.log10(np.sqrt(np.mean(mix ** 2))))
mix *= 10 ** (-1.0 / 20) / np.abs(mix).max()
fade = int(1.4 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 2
wavfile.write(os.environ.get('OUT', 'audio60.wav'), SR, (mix.T * 32767).astype(np.int16))
print('ok', mix.shape)
