import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/brand";
import { LAYOUT, TEXT } from "../config/film";
import { DogSymbol } from "../components/Symbol";
import { Label, Lines, Rule, serifStyle } from "../components/Type";
import { prog } from "../lib/ease";

/**
 * CENA 03 — NASCIMENTO DA IDENTIDADE
 * Campo Ameixa (vindo do consultório). Um fragmento do símbolo começa a se
 * desenhar em escala gigante. O ponto final da frase é a primeira forma:
 * cresce e vira o campo Sálvia (tipografia). Um círculo Creme abre o espaço
 * onde o símbolo vai nascer (S04). A paleta é apresentada como espaço, não como amostra.
 */
const T = { salvia: 44, salviaEnd: 66, creme: 84, cremeEnd: 106 };
/** fragmento: escala e posição (orelha direita encostada na borda, topo da cabeça em y) */
const FRAG = { s: 4.2, x: 1040, y: 520 };

export const S03_Nascimento: React.FC = () => {
  const frame = useCurrentFrame();
  const M = LAYOUT.margin;

  // o ponto que vira círculo
  const gS = prog(frame, T.salvia, T.salviaEnd, "inOut");
  const dotD = 13 + gS * 4600;
  const gC = prog(frame, T.creme, T.cremeEnd, "inOut");
  const cD = gC * 4600;

  const dot = (
    <span style={{ display: "inline-block", position: "relative", width: "0.2em", height: 0 }}>
      <span
        style={{
          position: "absolute",
          left: `calc(0.07em - ${dotD / 2}px)`,
          top: `calc(-0.085em - ${dotD / 2}px)`,
          width: dotD,
          height: dotD,
          borderRadius: "50%",
          background: COLORS.salvia,
        }}
      />
    </span>
  );

  return (
    <AbsoluteFill style={{ background: COLORS.ameixa, overflow: "hidden" }}>
      {/* fragmento: só o contorno da cabeça do símbolo, em escala grande, cortado pela tela */}
      <div style={{ position: "absolute", left: FRAG.x - 330 * FRAG.s, top: FRAG.y - 44 * FRAG.s }}>
        <DogSymbol width={350 * FRAG.s} color={COLORS.creme} parts={{ head: prog(frame, 0, 58, "inOut") }} />
      </div>

      <Label text={TEXT.s3.label} start={4} color={COLORS.creme} size={22} style={{ left: M, top: 190 }} />
      <Rule x={M} y={244} w={1080 - M * 2} start={6} color={COLORS.creme} />
      <Label text={TEXT.s3.swatch.ameixa} start={12} color={COLORS.creme} size={22} style={{ left: M, top: 1750 }} />

      <Lines
        lines={TEXT.s3.headline}
        start={10}
        size={96}
        color={COLORS.creme}
        style={{ left: M, top: 1290 }}
        tail={dot}
        unmaskAfter={T.salvia}
      />

      {/* Sálvia: tipografia */}
      {frame >= T.salvia + 10 && (
        <>
          <div
            style={{
              position: "absolute",
              left: M - 14,
              top: 470,
              ...serifStyle,
              fontSize: 620,
              lineHeight: 1,
              color: COLORS.ameixa,
              overflow: "hidden",
              paddingTop: 40,
            }}
          >
            <div style={{ transform: `translateY(${(1 - prog(frame, T.salvia + 10, T.salvia + 34, "out")) * 105}%)` }}>
              {TEXT.s3.specimen}
            </div>
          </div>
          <Label text={TEXT.s3.labelType} start={T.salvia + 12} color={COLORS.ameixa} size={22} style={{ left: M, top: 190 }} />
          <Rule x={M} y={244} w={1080 - M * 2} start={T.salvia + 12} color={COLORS.ameixa} />
          <Label text={TEXT.s3.swatch.salvia} start={T.salvia + 16} color={COLORS.ameixa} size={22} style={{ left: M, top: 1750 }} />
        </>
      )}

      {/* Creme: abre o espaço do símbolo */}
      {cD > 0 && (
        <div
          style={{
            position: "absolute",
            left: 540 - cD / 2,
            top: 960 - cD / 2,
            width: cD,
            height: cD,
            borderRadius: "50%",
            background: COLORS.creme,
          }}
        />
      )}
      {frame >= T.creme + 10 && (
        <Label text={TEXT.s3.swatch.creme} start={T.creme + 10} color={COLORS.ameixa} size={22} style={{ left: M, top: 1750 }} />
      )}
    </AbsoluteFill>
  );
};
