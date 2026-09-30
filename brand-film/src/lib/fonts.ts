import { continueRender, delayRender, staticFile } from "remotion";
import { FONTS } from "../config/brand";

let loaded = false;
export function loadBrandFonts() {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("fontes da marca");
  const faces = [
    new FontFace(FONTS.serif.family, `url(${staticFile(FONTS.serif.file)})`, { weight: "100 900" }),
    new FontFace(FONTS.sans.family, `url(${staticFile(FONTS.sans.file)})`, { weight: "100 900" }),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((fs) => {
      fs.forEach((f) => (document.fonts as unknown as Set<FontFace>).add(f));
      return document.fonts.ready;
    })
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}
