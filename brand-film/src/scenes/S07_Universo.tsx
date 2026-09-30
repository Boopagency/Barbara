import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/brand";
import { TEXT, UNIVERSE, UNIVERSE_PUSH } from "../config/film";
import { Shot } from "../components/Camera";
import { DogSymbol } from "../components/Symbol";
import { Wordmark } from "../components/Wordmark";
import { sansStyle } from "../components/Type";
import { EASE, clamp01 } from "../lib/ease";

/**
 * CENA 07 — UNIVERSO
 * Cortes secos, ritmo mais rápido, mas uma só gramática: cada plano "respira"
 * (leve recuo de escala) e alterna pessoa / cão / marca / aplicação.
 */
export const S07_Universo: React.FC = () => {
  const frame = useCurrentFrame();
  let t = 0;
  const idx = UNIVERSE.findIndex((it) => {
    if (frame < t + it.frames) return true;
    t += it.frames;
    return false;
  });
  const it = UNIVERSE[idx === -1 ? UNIVERSE.length - 1 : idx];
  const lf = frame - t;
  const breath = 1 + (UNIVERSE_PUSH - 1) * (1 - EASE.out(clamp01(lf / it.frames)));

  if (it.kind === "photo") {
    return (
      <AbsoluteFill style={{ background: COLORS.creme }}>
        <Shot asset={it.asset} state={{ x: it.x, y: it.y, s: it.s * breath, r: 0 }} />
      </AbsoluteFill>
    );
  }
  const bg = COLORS[it.bg];
  const fg = COLORS[it.fg];
  return (
    <AbsoluteFill style={{ background: bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${breath})` }}>
        {it.kind === "symbol" && <DogSymbol width={520} color={fg} />}
        {it.kind === "wordmark" && <Wordmark width={640} color={fg} />}
        {it.kind === "tagline" && (
          <div style={{ ...sansStyle, color: fg, fontSize: 30, letterSpacing: "0.3em", marginRight: "-0.3em" }}>
            {TEXT.s7.tagline}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
