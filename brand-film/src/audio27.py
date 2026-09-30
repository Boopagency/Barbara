from synth import *
import synth as _S
# ---------------- score ----------------
beat = 0.5
m = lambda x, t0, g=1.0, pan=0.0, send=0.25: add(music, x, t0, g, pan, send)

# A · 3/4 waltz, four bars (2.5 – 8.5): repara / escuta / sente / língua
waltz = [('D2', ['D4', 'F#4', 'A4']), ('B1', ['B3', 'D4', 'F#4']), ('G1', ['G3', 'B3', 'D4']), ('A1', ['A3', 'C#4', 'E4'])]
for bi, (root, chord) in enumerate(waltz):
    t0 = 2.5 + bi * 1.5
    m(kick(0.55), t0, 1.0, 0, 0.05)
    m(bass(note_hz(root), 1.4, 0.55), t0, 1.0, 0, 0.05)
    for k in (1, 2):
        if bi == 3 and k == 2:
            continue
        for j, n in enumerate(chord):
            m(marimba(note_hz(n), 0.5, 0.6), t0 + k * beat + j * 0.004, 0.12, -0.3 + 0.3 * j, 0.3)
    if bi >= 1:
        for k in range(6):
            m(shaker(0.5 if k % 2 else 0.8), t0 + k * 0.25, 0.35, 0.4)
# tongue bar: lazy bass slide
s, _ = sweep(note_hz('A1'), note_hz('D2'), 0.35)
m(s * env_ad(len(s), 0.01, 0.3) * 0.25, 8.1, 1.0)

# B · 4/4 groove under the grid (8.5 – 12.0)
prog = [(8.5, 'D2', ['D5', 'A4', 'F#5', 'A4']), (9.5, 'B1', ['D5', 'B4', 'F#5', 'B4']), (10.5, 'G1', ['D5', 'B4', 'G5', 'B4']), (11.5, 'A1', ['E5', 'C#5', 'A5', 'C#5'])]
for (t0, root, arp) in prog:
    lvl = prog.index((t0, root, arp))
    for k in range(2):
        tb = t0 + k * beat
        m(kick(0.75), tb, 1.0, 0, 0.03)
        if k == 1 and lvl >= 1:
            m(snap(0.7), tb, 0.8, 0.15, 0.35)
    for k in range(8):
        tb = t0 + k * 0.125 + (0.012 if k % 2 else 0)
        m(shaker(1.0 if k % 2 == 0 else 0.6), tb, 0.45 + 0.1 * lvl, 0.5)
    for k, off in enumerate([0, 0.375, 0.75]):
        m(bass(note_hz(root) * (1 if k != 1 else 1.5), 0.3, 0.7), t0 + off, 1.0)
    if lvl >= 1:
        for k in range(8):
            m(marimba(note_hz(arp[k % 4]), 0.5, 0.8), t0 + k * 0.125, 0.16 + 0.03 * lvl, -0.4 if k % 2 else 0.4, 0.3)
# riser into the unison
m(whoosh(0.5, 400, 6000, 0.6), 11.5, 0.8)
# unison: everything stops, one hit, all eyes blink
m(thump(90, 40, 0.5, 1.0), 12.0, 0.9)
for n in ['D3', 'A3', 'F#4', 'E5']:
    m(epiano(note_hz(n), 1.2, 1.0, 0.5), 12.0, 0.14, 0, 0.4)

# C · applications (12.5 – 14.5): groove heard "through paper"
cbus = np.zeros((2, N))
for i in range(4):
    t0 = 12.5 + i * 0.5
    add(cbus, kick(0.7), t0)
    add(cbus, bass(note_hz(['D2', 'D2', 'G1', 'A1'][i]), 0.45, 0.7), t0)
    for k in range(4):
        add(cbus, marimba(note_hz(['A4', 'D5', 'F#5', 'D5'][k]), 0.4), t0 + k * 0.125, 0.2)
for ch in range(2):
    cbus[ch] = filt(cbus[ch], 'low', 750)
music += cbus

# D · type climax (14.5 – 16.5): three temperaments
def chord_stab(t0, notes, g=0.16):
    for j, n in enumerate(notes):
        m(epiano(note_hz(n), 2.0, 1.4, 0.9), t0 + j * 0.006, g, -0.3 + 0.2 * j, 0.45)
m(kick(1.0, 1.4), 14.5, 1.0, 0, 0.1)
m(bass(note_hz('D2'), 0.9, 0.8), 14.5, 1.0)
chord_stab(14.5, ['D3', 'A3', 'E4', 'F#4', 'C#5'])
m(bass(note_hz('B1'), 0.45, 0.6), 15.0, 1.0)
chord_stab(15.0, ['B2', 'F#3', 'D4', 'A4'], 0.1)
m(bass(note_hz('G1'), 0.9, 0.6), 15.5, 1.0)
chord_stab(15.5, ['G2', 'D3', 'B3', 'F#4', 'A4'], 0.12)
for k in range(4):
    m(shaker(0.6), 15.5 + k * 0.25, 0.3, 0.4)

# F · the build (17.5 – 20.5): a pulse that grows
build_chords = [(17.5, 'D2', ['D4', 'A4']), (18.5, 'E2', ['E4', 'B4']), (19.5, 'F#2', ['F#4', 'C#5']), (20.0, 'G2', ['G4', 'D5'])]
for i in range(6):
    tb = 17.5 + i * 0.5
    m(kick(0.45 + 0.08 * i, 1.0), tb, 1.0, 0, 0.05)
for (t0, root, top) in build_chords:
    d = 1.0 if t0 < 19.5 else 0.5
    m(bass(note_hz(root), d, 0.5), t0, 1.0)
    steps = int(d / 0.125)
    for k in range(steps):
        tt = t0 + k * 0.125
        g = 0.07 + 0.12 * (tt - 17.5) / 3
        m(marimba(note_hz(top[k % 2]) * (2 if k % 4 == 3 else 1), 0.35, 0.9), tt, g, -0.5 if k % 2 else 0.5, 0.35)
m(whoosh(0.5, 300, 7000, 0.5, 2.5), 20.0, 0.9)
s, _ = sweep(220, 880, 0.5)
m(s * np.linspace(0, 1, len(s)) ** 2 * 0.06, 20.0, 1.0)

# H · the sonic logo on the wink (21.0)
m(thump(70, 38, 0.9, 1.0), 21.0, 1.0, 0, 0.05)
m(marimba(note_hz('A5'), 1.2, 1.2), 21.0, 0.34, -0.2, 0.5)
m(marimba(note_hz('D6'), 1.6, 1.2), 21.11, 0.34, 0.2, 0.6)
m(bell(note_hz('F#6'), 3.0), 21.11, 0.07, 0.3, 0.8)
for j, n in enumerate(['D3', 'A3', 'E4', 'F#4', 'A4', 'C#5']):
    m(epiano(note_hz(n), 4.5, 1.1, 2.2), 21.12 + j * 0.012, 0.11, -0.4 + 0.16 * j, 0.6)
m(pad([note_hz(n) for n in ['D3', 'A3', 'F#4', 'E4']], 5.9, 1.2, 2.6), 21.1, 0.55, 0, 0.5)
m(bass(note_hz('D2'), 3.0, 0.6), 21.0, 1.0)

# ---------------- sound effects from the visual events ----------------
events = json.load(open(os.environ.get('EV','events.json')))
groups = {}
for e in events:
    if 'grid' in e:
        key = (e['type'], round(e['t'] / 0.02))
        groups.setdefault(key, []).append(e)
    else:
        groups[(e['type'], e['t'], id(e))] = [e]

LETTER_NOTES = ['A4', 'B4', 'D5', 'E5', 'F#5', 'A5']
for key, evs in groups.items():
    e = evs[0]
    t = e['t']
    ty = e['type']
    v = e.get('v', 1.0)
    pan = float(np.mean([x.get('pan', 0) for x in evs]))
    cnt = len(evs)
    if 'grid' in e:
        v = v * min(1.4, 0.6 + 0.2 * cnt)
    s = lambda x, g=1.0, send=0.15, p=pan: add(sfx, x, t, g * v, p, send)
    if ty == 'bigblink':
        s(thump(160, 70, 0.22, 0.9), 0.9)
        s(whoosh(0.16, 1800, 500, 0.8, 1.2), 0.6)
        add(sfx, tk(0.55, 0.6), t + 0.16, 1.0, 0, 0.2)
    elif ty == 'zoomout':
        s(whoosh(0.42, 3500, 420, 1.0, 1.4), 1.0, 0.2)
        sw, _ = sweep(900, 260, 0.42)
        s(sw * np.sin(np.pi * np.arange(len(sw)) / len(sw)) * 0.05)
    elif ty in ('land', 'land2'):
        s(tk(0.8, 0.8), 1.0, 0.2)
        if ty == 'land2':
            s(thump(130, 60, 0.18, 0.4))
    elif ty == 'tick':
        s(tick(1.0 + 0.1 * pan, 0.9), 1.0, 0.1)
    elif ty == 'blink':
        s(tk(1.0, 0.8), 1.0, 0.2)
    elif ty == 'hop':
        s(blup(0.9), 1.0, 0.2)
    elif ty == 'letter':
        s(marimba(note_hz(LETTER_NOTES[e['i']]), 0.8, 1.1), 0.3, 0.35)
        s(tick(1.4, 0.4), 1.0, 0.1)
    elif ty == 'swing':
        s(whoosh(0.3, 500, 2200, 1.0, 1.2), 1.0, 0.15)
    elif ty == 'flop':
        s(thump(190, 105, 0.12, 0.7), 1.0, 0.15)
        s(felt(note_hz('D3'), 0.4), 1.0, 0.2)
    elif ty == 'ripple':
        for j, n in enumerate(['F#5', 'D5', 'A4']):
            add(sfx, marimba(note_hz(n), 0.4, 1.0), t + j * 0.03, 0.12 * v, 0.3 - 0.3 * j, 0.3)
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
        x = whoosh(0.45, 500, 5500, 1.2, 1.1)
        n = len(x)
        pn = np.linspace(-0.8, 0.8, n)
        add(sfx, np.stack([x * np.cos((pn + 1) * np.pi / 4), x * np.sin((pn + 1) * np.pi / 4)]) * 1.4, t, v, 0, 0.2)
    elif ty == 'cut':
        s(paper(0.12, 0.8), 1.0, 0.05)
        s(tk(0.5, 0.5))
    elif ty == 'tk':
        s(tk(1.2 if 'grid' in e else 1.35, 0.6), 1.0, 0.15)
    elif ty == 'wood':
        lvl = e.get('grid', 2)
        s(felt(note_hz(['D3', 'D3', 'F#3', 'A3', 'D4', 'D4'][lvl]), 0.55), 1.0, 0.15)
    elif ty == 'draw':
        s(marker(e.get('d', 0.18), 0.9), 1.0, 0.05)
    elif ty == 'unison':
        pass
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
    elif ty == 'hit':
        s(thump(100, 45, 0.4, 0.8), 1.0, 0.1)
    elif ty == 'bounce':
        for j in range(3):
            add(sfx, blup(0.35), t + 0.1 + j * 0.06, v, -0.3 + 0.3 * j, 0.2)
            add(sfx, thump(170, 90, 0.08, 0.35), t + 0.14 + j * 0.06, v, -0.3 + 0.3 * j, 0.1)
    elif ty == 'wobble':
        d = 0.6
        tt = T(d)
        x = np.sin(2 * np.pi * 330 * tt + 1.2 * np.sin(2 * np.pi * 7 * tt) * np.exp(-tt / 0.2)) * env_ad(len(tt), 0.005, 0.18)
        s(x * 0.25, 1.0, 0.3)
    elif ty == 'pop':
        s(pop(1.5 if e.get('hi') else 1.0, 0.8), 1.0, 0.25)
    elif ty == 'breath':
        s(breath(0.75, 1.0), 1.0, 0.3)
    elif ty == 'slowblink':
        s(tk(0.7, 0.55), 1.0, 0.3)
    elif ty == 'wink':
        s(tk(1.15, 1.2), 1.0, 0.35)
        s(tick(1.2, 0.8), 1.0, 0.2)
    elif ty == 'move':
        s(whoosh(0.6, 250, 1400, 0.45, 1.0), 1.0, 0.2)
    elif ty in ('type1', 'type2'):
        s(felt(note_hz('D4' if ty == 'type1' else 'A4'), 0.35), 1.0, 0.4)
    elif ty == 'tagline':
        s(shimmer(0.9, 2349, 0.8), 1.0, 0.6)

# room tone: the faintest air, so silence feels like a space rather than a dropout
room = filt(rs.standard_normal(N), 'band', (120, 2500)) * 0.0022
music += np.stack([room, np.roll(room, 997)])

# ---------------- reverb ----------------
ir_len = int(1.9 * SR)
tt = np.arange(ir_len) / SR
ir = np.stack([rs.standard_normal(ir_len), rs.standard_normal(ir_len)]) * np.exp(-tt / 0.45)
for ch in range(2):
    ir[ch] = filt(ir[ch], 'low', 5200)
ir[:, :int(0.012 * SR)] = 0
ir /= np.abs(ir).sum(axis=1, keepdims=True) ** 0.5 * 12
wet = np.stack([fftconvolve(verb_send[c], ir[c])[:N] for c in range(2)])

mix = music * 0.62 + sfx * 1.1 + wet * 0.85
# gentle high-pass, soft clip, normalise
for ch in range(2):
    mix[ch] = filt(mix[ch], 'high', 28)
peak_target = 10 ** (-1.0 / 20)
mix = mix / (np.abs(mix).max() + 1e-9) * 1.6
mix = np.tanh(mix) / np.tanh(1.6)
rms = np.sqrt(np.mean(mix ** 2))
print('rms dBFS', 20 * np.log10(rms))
mix *= peak_target / np.abs(mix).max()
fade = int(0.9 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 2
wavfile.write(os.environ.get('OUT','audio.wav'), SR, (mix.T * 32767).astype(np.int16))
print('ok', mix.shape)
