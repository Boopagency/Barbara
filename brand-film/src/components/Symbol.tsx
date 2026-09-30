import React, { useMemo } from "react";
import data from "../brand/generated/symbol.json";
import { EASE, clamp01 } from "../lib/ease";
import { MOTION } from "../config/film";

/**
 * Símbolo oficial (dog) vetorizado a partir do PNG da marca.
 * O desenho visível é SEMPRE o preenchimento oficial; as linhas centrais
 * servem apenas de máscara para o stroke reveal (sem alterar o traço).
 */
const VB_W = data.symbol.viewBox[2];
const VB_H = data.symbol.viewBox[3];
export const SYMBOL_ASPECT = VB_H / VB_W;
export const SYMBOL_VB = { w: VB_W, h: VB_H };

type Part = keyof typeof MOTION.symbolDraw;

let uid = 0;

export const DogSymbol: React.FC<{
  width: number;
  color: string;
  /** progresso global 0→1 (usa as janelas de MOTION.symbolDraw) */
  t?: number;
  /** ou progresso por peça */
  parts?: Partial<Record<Part, number>>;
  style?: React.CSSProperties;
}> = ({ width, color, t = 1, parts, style }) => {
  const id = useMemo(() => `dogmask${uid++}`, []);
  const windows = MOTION.symbolDraw;
  const p = (k: Part) => {
    // com `parts`, peça não informada = não desenhada
    if (parts) return clamp01(parts[k] ?? 0);
    const [a, b] = windows[k];
    return EASE.inOut(clamp01((t - a) / (b - a)));
  };
  const all = (Object.keys(windows) as Part[]).every((k) => p(k) >= 1);
  const maskW = data.strokeWidth * 1.9;
  const strokes = data.draw.strokes as Record<string, { points: number[][]; length: number }>;
  const grow = data.draw.grow as Record<string, { cx: number; cy: number; rx: number; ry: number }>;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={width}
      height={width * SYMBOL_ASPECT}
      style={{ overflow: "visible", display: "block", ...style }}
    >
      {!all && (
        <defs>
          <mask id={id} maskUnits="userSpaceOnUse" x={-20} y={-20} width={VB_W + 40} height={VB_H + 40}>
            <rect x={-20} y={-20} width={VB_W + 40} height={VB_H + 40} fill="black" />
            {Object.entries(strokes).map(([k, s]) => {
              const v = p(k as Part);
              if (v <= 0) return null;
              const d = "M" + s.points.map(([x, y]) => `${x} ${y}`).join(" L");
              return (
                <path
                  key={k}
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke="white"
                  strokeWidth={maskW}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1 2"
                  strokeDashoffset={1 - v}
                />
              );
            })}
            {Object.entries(grow).map(([k, g]) => {
              const v = p(k as Part);
              if (v <= 0) return null;
              return <ellipse key={k} cx={g.cx} cy={g.cy} rx={g.rx * v} ry={g.ry * v} fill="white" />;
            })}
          </mask>
        </defs>
      )}
      <g mask={all ? undefined : `url(#${id})`}>
        <g fill={color} transform={data.symbol.groupTransform}>
          {data.symbol.paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
    </svg>
  );
};
