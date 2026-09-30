/**
 * Tokens da identidade Bárbara Fonseca.
 * Cores amostradas dos arquivos oficiais em Barbara/Brand/*.png
 * (Vinho escuro vem da página de paleta do brand book — mockups/…-8.png).
 * NÃO adicionar cores novas aqui.
 */
export const COLORS = {
  ameixa: "#653A47", // oficial (Ameixa sobre Creme.png)
  creme: "#F7F0E4", // oficial (Creme quente)
  salvia: "#A0AD90", // oficial (Ameixa sobre Sálvia.png) — o brand book impresso indica #A7B195
  vinho: "#4B2C35", // Vinho escuro (brand book)
} as const;

export type BrandColor = keyof typeof COLORS;

/**
 * Tipografia.
 * - Montserrat 500 = subtítulo oficial "MÉDICA VETERINÁRIA" (identificação exata).
 * - Serif editorial: os arquivos de fonte não estão no repositório; Fraunces
 *   (opsz 144 / SOFT 50) é a correspondência mais próxima do serif usado nos
 *   mockups da marca (site, receituário, brand book). Troque aqui se o arquivo
 *   oficial for fornecido. O LOGO nunca é redigitado: usa-se o vetor oficial.
 */
export const FONTS = {
  serif: {
    family: "BF Serif",
    file: "fonts/Fraunces-Variable.ttf",
    variation: '"opsz" 144, "SOFT" 50, "WONK" 0',
    weight: 380,
  },
  sans: {
    family: "BF Sans",
    file: "fonts/Montserrat-Variable.ttf",
    weight: 500,
  },
} as const;
