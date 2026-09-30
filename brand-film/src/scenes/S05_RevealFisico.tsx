import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/brand";
import { CAMERAS } from "../config/film";
import { Shot } from "../components/Camera";
import { prog } from "../lib/ease";

/**
 * CENA 05 — REVEAL FÍSICO (hero)
 * Match cut: o símbolo desenhado vira o relevo (emboss) na capa do caderno.
 * Recuo revela o wordmark em foil. A capa "abre" (máscara da lombada, com
 * sombra) para o brand book: logo → paleta → tipografia → plano geral.
 * Termina entrando no wordmark da caixa → match cut com o cartão (S06).
 */
const OPEN = { start: 38, dur: 22 };

export const S05_RevealFisico: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, OPEN.start, OPEN.start + OPEN.dur, "inOut");
  const edge = 1080 * (1 - p); // a borda da "capa" varre da direita para a esquerda
  const bookF = frame - OPEN.start;
  return (
    <AbsoluteFill style={{ background: COLORS.vinho }}>
      {frame < OPEN.start + OPEN.dur && <Shot asset="notebook" keys={CAMERAS.notebook} />}
      {frame >= OPEN.start && (
        <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${edge}px)` }}>
          <Shot asset="brandBook" keys={CAMERAS.brandBook} frame={bookF} />
          {/* sombra da página virando, presa à borda */}
          {p < 1 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: edge,
                width: 260,
                background: `linear-gradient(90deg, rgba(75,44,53,${0.55 * (1 - p)}), rgba(75,44,53,0))`,
              }}
            />
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
