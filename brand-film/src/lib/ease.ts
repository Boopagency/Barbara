import { Easing, interpolate } from "remotion";

/** Curvas do filme. Poucas, usadas de forma consistente. */
export const EASE = {
  /** padrão: entradas/saídas de câmera e máscaras */
  inOut: Easing.bezier(0.65, 0, 0.25, 1),
  /** chegada suave (tipografia, reveals) */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** aceleração para cortes (push-in antes de um corte) */
  in: Easing.bezier(0.55, 0, 0.9, 0.35),
  linear: (t: number) => t,
} as const;

export type EaseName = keyof typeof EASE;

/** 0→1 entre os frames a e b, com easing e clamp. */
export const prog = (frame: number, a: number, b: number, ease: EaseName = "out") =>
  interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE[ease],
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
