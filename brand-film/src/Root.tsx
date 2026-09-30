import React from "react";
import { Composition } from "remotion";
import { BrandFilm } from "./BrandFilm";
import { FORMAT, TOTAL_FRAMES } from "./config/film";

export const Root: React.FC = () => (
  <Composition
    id="BrandFilm"
    component={BrandFilm}
    durationInFrames={TOTAL_FRAMES}
    fps={FORMAT.fps}
    width={FORMAT.width}
    height={FORMAT.height}
  />
);
