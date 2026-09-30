import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/brand";
import { CAMERAS } from "../config/film";
import { Shot } from "../components/Camera";
import { prog } from "../lib/ease";

/**
 * CENA 06 — A MARCA SAI DO PAPEL
 * Encadeamento pelo próprio logo (âncoras em config/film.ts):
 *   wordmark da caixa → wordmark do cartão (recuo) → símbolo do cartão
 *   → símbolo bordado no jaleco (recuo) → wordmark do jaleco
 *   → wordmark da embalagem (a câmera “desgira” 16°) → a embalagem sai
 *   pelo topo e revela o digital por baixo (paralaxe).
 */
const CUT = { coat: 48, box: 96, slide: 132, slideEnd: 152 };

export const S06_Aplicacoes: React.FC = () => {
  const frame = useCurrentFrame();
  const slide = prog(frame, CUT.slide, CUT.slideEnd, "inOut");
  return (
    <AbsoluteFill style={{ background: COLORS.creme }}>
      {frame < CUT.coat && <Shot asset="cards" keys={CAMERAS.cards} />}
      {frame >= CUT.coat && frame < CUT.box && <Shot asset="coat" keys={CAMERAS.coat} frame={frame - CUT.coat} />}
      {frame >= CUT.slide && <Shot asset="digital" keys={CAMERAS.digital} frame={frame - CUT.slide} />}
      {frame >= CUT.box && slide < 1 && (
        <AbsoluteFill
          style={{
            transform: `translateY(${-slide * 1920}px)`,
            boxShadow: slide > 0 ? `0 40px 90px rgba(75,44,53,${0.45 * Math.sin(slide * Math.PI)})` : undefined,
          }}
        >
          <Shot asset="box" keys={CAMERAS.box} frame={frame - CUT.box} cover={false} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
