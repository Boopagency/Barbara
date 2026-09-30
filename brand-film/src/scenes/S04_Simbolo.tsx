import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/brand";
import { CAMERAS, MOTION, S4_SYMBOL_END, TEXT } from "../config/film";
import { Camera } from "../components/Camera";
import { DogSymbol, SYMBOL_VB } from "../components/Symbol";
import { Lines } from "../components/Type";
import { prog } from "../lib/ease";

/**
 * CENA 04 — O SÍMBOLO
 * Um único desenho acontecendo, visto por três "câmeras" em close extremo
 * (orelha → olho/focinho → língua) e um recuo até o símbolo inteiro.
 * A piscada é o último traço: a personalidade fecha o desenho.
 */
export const S04_Simbolo: React.FC = () => {
  const frame = useCurrentFrame();
  const W = MOTION.symbolDrawS4;
  const parts = Object.fromEntries(
    Object.entries(W).map(([k, [a, b]]) => [k, prog(frame, a, b, "inOut")]),
  );
  return (
    <AbsoluteFill style={{ background: COLORS.creme }}>
      <Camera keys={CAMERAS.symbol} vw={1080} vh={1920} cw={SYMBOL_VB.w} ch={SYMBOL_VB.h} cover={false}>
        <DogSymbol width={SYMBOL_VB.w} color={COLORS.ameixa} parts={parts} />
      </Camera>
      <Lines
        lines={TEXT.s4.caption}
        start={90}
        size={64}
        color={COLORS.ameixa}
        align="center"
        style={{ left: 0, width: 1080, top: S4_SYMBOL_END.cy + (S4_SYMBOL_END.w * SYMBOL_VB.h) / SYMBOL_VB.w / 2 + 120 }}
      />
    </AbsoluteFill>
  );
};
