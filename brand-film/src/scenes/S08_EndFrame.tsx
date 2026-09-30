import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/brand";
import { TEXT } from "../config/film";
import { DogSymbol, SYMBOL_ASPECT } from "../components/Symbol";
import { Wordmark } from "../components/Wordmark";
import { Lines } from "../components/Type";
import { prog } from "../lib/ease";

/**
 * CENA 08 — ASSINATURA
 * Fundo limpo. O símbolo se desenha (eco da S04, mais rápido), depois o
 * wordmark sobe linha a linha e o subtítulo fecha o tracking até o oficial.
 */
const SYM = { w: 360, cy: 760, start: 6, end: 56 };
const WM = { w: 560, top: 1060, l1: 50, l2: 55, sub: 60, subEnd: 92 };

export const S08_EndFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const t = prog(frame, SYM.start, SYM.end, "linear");
  return (
    <AbsoluteFill style={{ background: COLORS.creme }}>
      <div style={{ position: "absolute", left: 540 - SYM.w / 2, top: SYM.cy - (SYM.w * SYMBOL_ASPECT) / 2 }}>
        <DogSymbol width={SYM.w} color={COLORS.ameixa} t={t} />
      </div>
      <div style={{ position: "absolute", left: 540 - WM.w / 2, top: WM.top }}>
        <Wordmark
          width={WM.w}
          color={COLORS.ameixa}
          line1={prog(frame, WM.l1, WM.l1 + 24, "out")}
          line2={prog(frame, WM.l2, WM.l2 + 24, "out")}
          sub={prog(frame, WM.sub, WM.subEnd, "out")}
        />
      </div>
      {TEXT.s8.tagline && (
        <Lines lines={[TEXT.s8.tagline]} start={96} size={44} color={COLORS.ameixa} align="center" style={{ left: 0, width: 1080, top: 1560 }} />
      )}
    </AbsoluteFill>
  );
};
