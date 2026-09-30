import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/brand";
import { CAMERAS, LAYOUT, MOTION, TEXT } from "../config/film";
import { Frame, Shot } from "../components/Camera";
import { Lines } from "../components/Type";
import { EASE, clamp01, lerp, prog } from "../lib/ease";

/**
 * CENA 02 — CUIDAR
 * A moldura cresce para o formato de página. Mãos → cão → Bárbara, trocados por
 * wipes verticais controlados. No fim a câmera entra no painel ameixa do
 * consultório: a cor do espaço dela vira o campo de cor da marca (S03).
 */
const SHOTS = [
  { asset: "barbaraArch", cam: CAMERAS.arch, at: -120 }, // continuação da S01
  { asset: "careHands", cam: CAMERAS.hands, at: 6 },
  { asset: "dogHeadTilt", cam: CAMERAS.headTilt, at: 40 },
  { asset: "barbaraPortrait", cam: CAMERAS.portrait, at: 74 },
];
const BEATS = [
  { start: 12, exit: 36 },
  { start: 46, exit: 70 },
  { start: 82, exit: 100 },
];
const PUSH = { start: 100, end: 126 };

export const S02_Cuidar: React.FC = () => {
  const frame = useCurrentFrame();
  const A = LAYOUT.s1Frame;
  const B = LAYOUT.s2Frame;
  // moldura: S01 → página → (push) tela cheia
  const g = prog(frame, 0, 24, "inOut");
  const full = prog(frame, PUSH.start, PUSH.end, "in");
  const rect = {
    x: lerp(lerp(A.x, B.x, g), 0, full),
    y: lerp(lerp(A.y, B.y, g), 0, full),
    w: lerp(lerp(A.w, B.w, g), 1080, full),
    h: lerp(lerp(A.h, B.h, g), 1920, full),
  };
  const plum = prog(frame, PUSH.end - 12, PUSH.end - 1, "inOut");

  return (
    <AbsoluteFill style={{ background: COLORS.creme }}>
      {BEATS.map((b, i) => (
        <Lines
          key={i}
          lines={[TEXT.s2.beats[i]]}
          start={b.start}
          exitAt={b.exit}
          size={76}
          color={COLORS.ameixa}
          style={{ left: LAYOUT.s2TextX, top: LAYOUT.textTop }}
        />
      ))}
      <Frame {...{ x: rect.x, y: rect.y, w: rect.w, h: rect.h }}>
        {SHOTS.map((s, i) => {
          const next = SHOTS[i + 1];
          if (frame < s.at) return null;
          if (next && frame >= next.at + MOTION.wipe) return null;
          // entrada: revela de baixo para cima; saída: sobe levemente (paralaxe)
          const pin = i === 0 ? 1 : clamp01(EASE.inOut((frame - s.at) / MOTION.wipe));
          const pout = next ? clamp01(EASE.inOut((frame - next.at) / MOTION.wipe)) : 0;
          const lf = frame - s.at;
          return (
            <div
              key={s.asset}
              style={{
                position: "absolute",
                inset: 0,
                clipPath: `inset(${(1 - pin) * 100}% 0 0 0)`,
                transform: `translateY(${-pout * 0.12 * rect.h}px)`,
              }}
            >
              <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1.08, 1, pin)})`, transformOrigin: "50% 100%" }}>
                <Shot asset={s.asset} keys={s.cam} frame={lf} vw={rect.w} vh={rect.h} />
              </div>
            </div>
          );
        })}
        <AbsoluteFill style={{ background: COLORS.ameixa, opacity: plum }} />
      </Frame>
    </AbsoluteFill>
  );
};
