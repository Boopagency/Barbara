import React, { useMemo } from "react";
import data from "../brand/generated/wordmark.json";
import { clamp01 } from "../lib/ease";

/**
 * Wordmark oficial vetorizado (nome em 2 linhas + subtítulo letra a letra).
 * Animações só movem/mascaram as peças; o estado final é idêntico ao logo.
 */
type Entry = { sourceBox: number[]; groupTransform: string; paths: string[] };
const full = data.full as Entry;
const [FX0, FY0, FX1, FY1] = full.sourceBox;
export const WORDMARK_VB = { w: FX1 - FX0, h: FY1 - FY0 };

const Piece: React.FC<{ e: Entry }> = ({ e }) => (
  <g transform={`translate(${e.sourceBox[0] - FX0},${e.sourceBox[1] - FY0})`}>
    <g transform={e.groupTransform}>
      {e.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  </g>
);

let uid = 0;

export const Wordmark: React.FC<{
  width: number;
  color: string;
  /** progresso (já com easing) de cada parte: 0 = escondido, 1 = no lugar */
  line1?: number;
  line2?: number;
  sub?: number;
  /** abertura de tracking do subtítulo (0 = oficial) */
  subSpread?: number;
  style?: React.CSSProperties;
}> = ({ width, color, line1 = 1, line2 = 1, sub = 1, subSpread = 0.55, style }) => {
  const id = useMemo(() => `wm${uid++}`, []);
  const lines = [data.line1 as Entry, data.line2 as Entry];
  const glyphs = data.subtitleGlyphs as Entry[];
  const subBox = (data.subtitle as Entry).sourceBox;
  const subCx = (subBox[0] + subBox[2]) / 2;
  const ps = [line1, line2];
  const done = line1 >= 1 && line2 >= 1 && sub >= 1;

  if (done) {
    return (
      <svg viewBox={`0 0 ${WORDMARK_VB.w} ${WORDMARK_VB.h}`} width={width} height={(width * WORDMARK_VB.h) / WORDMARK_VB.w} style={{ overflow: "visible", display: "block", ...style }}>
        <g fill={color}>
          <Piece e={full} />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox={`0 0 ${WORDMARK_VB.w} ${WORDMARK_VB.h}`} width={width} height={(width * WORDMARK_VB.h) / WORDMARK_VB.w} style={{ overflow: "visible", display: "block", ...style }}>
      <defs>
        {lines.map((l, i) => (
          <clipPath id={`${id}c${i}`} key={i}>
            <rect x={-20} y={l.sourceBox[1] - FY0 - (i === 0 ? 4 : 0)} width={WORDMARK_VB.w + 40} height={l.sourceBox[3] - l.sourceBox[1] + 4} />
          </clipPath>
        ))}
      </defs>
      <g fill={color}>
        {lines.map((l, i) => {
          const h = l.sourceBox[3] - l.sourceBox[1];
          return (
            <g key={i} clipPath={`url(#${id}c${i})`}>
              <g transform={`translate(0 ${(1 - clamp01(ps[i])) * h * 1.05})`}>
                <Piece e={l} />
              </g>
            </g>
          );
        })}
        {glyphs.map((g, i) => {
          const cx = (g.sourceBox[0] + g.sourceBox[2]) / 2;
          const k = clamp01(sub);
          return (
            <g key={i} opacity={k} transform={`translate(${(cx - subCx) * subSpread * (1 - k)} 0)`}>
              <Piece e={g} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
