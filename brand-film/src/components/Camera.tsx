import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { CameraKey, CameraState, cameraAt, clampCover } from "../lib/camera";

type CameraProps = {
  keys?: CameraKey[];
  state?: CameraState;
  /** frame local (padrão: frame da Sequence) */
  frame?: number;
  vw: number;
  vh: number;
  cw: number;
  ch: number;
  cover?: boolean;
  children: React.ReactNode;
};

/** Move um conteúdo (foto ou vetor) sob um viewport, a partir de keyframes. */
export const Camera: React.FC<CameraProps> = ({ keys, state, frame, vw, vh, cw, ch, cover = true, children }) => {
  const f = useCurrentFrame();
  let c = state ?? cameraAt(keys!, frame ?? f);
  if (cover) c = clampCover(c, vw, vh, cw, ch);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: cw,
          height: ch,
          transformOrigin: "0 0",
          transform: `translate(${vw / 2}px, ${vh / 2}px) rotate(${c.r}deg) scale(${c.s}) translate(${-c.x}px, ${-c.y}px)`,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const IMG_W = 1122;
export const IMG_H = 1402;

type ShotProps = Omit<CameraProps, "children" | "cw" | "ch" | "vw" | "vh"> & {
  asset: string;
  vw?: number;
  vh?: number;
};

/** Plano fotográfico: imagem original em aspect ratio preservado, recortada pela câmera. */
export const Shot: React.FC<ShotProps> = ({ asset, vw = 1080, vh = 1920, ...rest }) => (
  <Camera vw={vw} vh={vh} cw={IMG_W} ch={IMG_H} {...rest}>
    <Img
      src={staticFile(`assets/${asset}.png`)}
      style={{ width: IMG_W, height: IMG_H, display: "block" }}
    />
  </Camera>
);

/** Viewport retangular posicionado (moldura editorial / máscara de corte). */
export const Frame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", ...style }}>
    {children}
  </div>
);

export const Fill = AbsoluteFill;
