import React from "react";
import { useCurrentFrame } from "remotion";
import { FONTS } from "../config/brand";
import { MOTION } from "../config/film";
import { lerp, prog } from "../lib/ease";

/**
 * SISTEMA TIPOGRÁFICO — um único comportamento para o filme inteiro.
 *  • Lines (serif editorial): cada linha sobe de dentro de uma máscara,
 *    com o tracking se fechando levemente; saída = continua subindo.
 *  • Label (sans caixa alta): tracking fecha do aberto para o final + opacidade.
 */

export const serifStyle: React.CSSProperties = {
  fontFamily: FONTS.serif.family,
  fontVariationSettings: FONTS.serif.variation,
  fontWeight: FONTS.serif.weight,
};
export const sansStyle: React.CSSProperties = {
  fontFamily: FONTS.sans.family,
  fontWeight: FONTS.sans.weight,
  textTransform: "uppercase",
};

/** estilo da linha i para um bloco que entra em `start` e sai em `exitAt` */
export function lineMotion(frame: number, start: number, i: number, exitAt?: number, n = 1) {
  const T = MOTION.type;
  const a = start + i * T.lineStagger;
  const pin = prog(frame, a, a + T.lineIn, "out");
  let y = (1 - pin) * T.riseEm;
  if (exitAt !== undefined) {
    // saída na mesma direção da entrada (continua subindo), de cima para baixo
    const b = exitAt + i * Math.round(T.lineStagger * 0.6);
    const pout = prog(frame, b, b + T.lineOut, "in");
    y -= pout * T.riseEm;
  }
  void n;
  return {
    transform: `translateY(${y}em)`,
    letterSpacing: `${lerp(T.trackingFrom, 0, pin)}em`,
  } as React.CSSProperties;
}

export const Lines: React.FC<{
  lines: readonly string[];
  start: number;
  exitAt?: number;
  size: number;
  color: string;
  lineHeight?: number;
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
  /** conteúdo extra no fim da última linha (ex.: ponto que vira forma) */
  tail?: React.ReactNode;
  /** desliga a máscara depois da entrada (para elementos que crescem para fora) */
  unmaskAfter?: number;
}> = ({ lines, start, exitAt, size, color, lineHeight = 1.06, align = "left", style, tail, unmaskAfter }) => {
  const frame = useCurrentFrame();
  const unmask = unmaskAfter !== undefined && frame >= unmaskAfter;
  return (
    <div style={{ position: "absolute", ...serifStyle, fontSize: size, color, lineHeight, textAlign: align, ...style }}>
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            overflow: unmask ? "visible" : "hidden",
            paddingTop: "0.14em",
            paddingBottom: "0.1em",
            marginTop: i === 0 ? "-0.14em" : "-0.24em",
          }}
        >
          <span style={{ display: "inline-block", whiteSpace: "nowrap", ...lineMotion(frame, start, i, exitAt, lines.length) }}>
            {l}
            {i === lines.length - 1 ? tail : null}
          </span>
        </div>
      ))}
    </div>
  );
};

export const Label: React.FC<{
  text: string;
  start: number;
  exitAt?: number;
  size?: number;
  color: string;
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
}> = ({ text, start, exitAt, size = 24, color, align = "left", style }) => {
  const frame = useCurrentFrame();
  const L = MOTION.label;
  const pin = prog(frame, start, start + L.in, "out");
  const pout = exitAt !== undefined ? prog(frame, exitAt, exitAt + 10, "in") : 0;
  const ls = lerp(L.trackingFrom, L.trackingTo, pin);
  return (
    <div
      style={{
        position: "absolute",
        ...sansStyle,
        fontSize: size,
        color,
        letterSpacing: `${ls}em`,
        // compensa o tracking final para o alinhamento ótico
        marginRight: align === "center" ? `-${ls}em` : undefined,
        opacity: pin * (1 - pout),
        whiteSpace: "nowrap",
        textAlign: align,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Fio (hairline) editorial que se desenha da esquerda para a direita. */
export const Rule: React.FC<{
  x: number;
  y: number;
  w: number;
  start: number;
  dur?: number;
  color: string;
  opacity?: number;
}> = ({ x, y, w, start, dur = 24, color, opacity = 0.55 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, start + dur, "inOut");
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w * p,
        height: 2,
        background: color,
        opacity,
      }}
    />
  );
};
