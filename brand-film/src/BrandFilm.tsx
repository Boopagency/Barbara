import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "./config/brand";
import { MOTION, SCENES, SceneId } from "./config/film";
import { Grain } from "./components/Grain";
import { loadBrandFonts } from "./lib/fonts";
import { S01_Barbara } from "./scenes/S01_Barbara";
import { S02_Cuidar } from "./scenes/S02_Cuidar";
import { S03_Nascimento } from "./scenes/S03_Nascimento";
import { S04_Simbolo } from "./scenes/S04_Simbolo";
import { S05_RevealFisico } from "./scenes/S05_RevealFisico";
import { S06_Aplicacoes } from "./scenes/S06_Aplicacoes";
import { S07_Universo } from "./scenes/S07_Universo";
import { S08_EndFrame } from "./scenes/S08_EndFrame";

loadBrandFonts();

const COMPONENTS: Record<SceneId, React.FC> = {
  S01_Barbara,
  S02_Cuidar,
  S03_Nascimento,
  S04_Simbolo,
  S05_RevealFisico,
  S06_Aplicacoes,
  S07_Universo,
  S08_EndFrame,
};

export const BrandFilm: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: COLORS.creme }}>
      {SCENES.map((s) => {
        const C = COMPONENTS[s.id];
        const el = (
          <Sequence key={s.id} name={s.id} from={from} durationInFrames={s.duration}>
            <C />
          </Sequence>
        );
        from += s.duration;
        return el;
      })}
      <Grain opacity={MOTION.grain} />
    </AbsoluteFill>
  );
};
