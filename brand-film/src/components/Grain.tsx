import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

/** Grão fotográfico sutil, determinístico (mesmo frame = mesmo grão). */
export const Grain: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const tiles = useMemo(() => {
    if (typeof document === "undefined") return [] as string[];
    return [0, 1, 2, 3].map((k) => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const ctx = c.getContext("2d")!;
      const img = ctx.createImageData(256, 256);
      for (let i = 0; i < 256 * 256; i++) {
        const v = Math.floor(random(`g${k}-${i}`) * 255);
        img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
        img.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      return c.toDataURL();
    });
  }, []);
  if (!opacity || tiles.length === 0) return null;
  const k = frame % tiles.length;
  const ox = Math.floor(random(`ox${frame}`) * 256);
  const oy = Math.floor(random(`oy${frame}`) * 256);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${tiles[k]})`,
        backgroundSize: "384px 384px",
        backgroundPosition: `${ox}px ${oy}px`,
        mixBlendMode: "overlay",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};
