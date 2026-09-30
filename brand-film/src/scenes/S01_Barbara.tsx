import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/brand";
import { CAMERAS, LAYOUT, TEXT } from "../config/film";
import { Frame, Shot } from "../components/Camera";
import { Label, Lines } from "../components/Type";
import { prog } from "../lib/ease";

/**
 * CENA 01 — BÁRBARA
 * Página creme; a fotografia abre como um obturador horizontal dentro de uma
 * moldura 4:5 com muito espaço negativo. Frase → nome. A marca ainda não aparece.
 */
export const S01_Barbara: React.FC = () => {
  const frame = useCurrentFrame();
  const F = LAYOUT.s1Frame;
  const open = prog(frame, 4, 40, "inOut");
  const inset = 50 * (1 - open);
  return (
    <AbsoluteFill style={{ background: COLORS.creme }}>
      <Frame {...F} style={{ clipPath: `inset(${inset}% 0 ${inset}% 0)` }}>
        <Shot asset="barbaraArch" keys={CAMERAS.arch} vw={F.w} vh={F.h} />
      </Frame>

      <Lines
        lines={TEXT.s1.headline}
        start={22}
        exitAt={62}
        size={76}
        color={COLORS.ameixa}
        style={{ left: LAYOUT.s1TextX, top: LAYOUT.textTop }}
      />
      <Lines
        lines={[TEXT.s1.name]}
        start={72}
        exitAt={104}
        size={76}
        color={COLORS.ameixa}
        style={{ left: LAYOUT.s1TextX, top: LAYOUT.textTop }}
      />
      <Label
        text={TEXT.s1.role}
        start={80}
        exitAt={102}
        size={24}
        color={COLORS.ameixa}
        style={{ left: LAYOUT.s1TextX, top: LAYOUT.textTop + 118 }}
      />
    </AbsoluteFill>
  );
};
