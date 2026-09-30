# Bárbara Fonseca — Brand Film

Filme de apresentação da identidade visual de **Bárbara Fonseca, Médica Veterinária**.
Vertical **1080 × 1920 · 9:16 · 30 fps · 34,8 s (1044 frames)** · H.264, sem áudio.

- Vídeo final: `out/barbara-fonseca-brand-film.mp4`
- Contact sheet de QA: `out/contact-sheet.jpg`
- Source: `src/` (Remotion + React, renderização frame a frame)

## Como rodar

```bash
cd brand-film
npm install
npm run studio          # preview com timeline e scrub por frame
npm run render          # gera out/barbara-fonseca-brand-film.mp4
npm run contact-sheet   # gera out/contact-sheet.jpg a partir do MP4 (requer ffmpeg)
```

Sem o Chrome do Remotion (ex.: CI/containers): `REMOTION_CHROME=/caminho/headless_shell npm run render`.
Os assets originais ficam intocados em `../Barbara`. `npm run sync-assets` (roda sozinho
antes do studio e do render) copia essas imagens para `public/assets` com nomes semânticos
definidos em `src/config/assets.json`.

## Onde editar

| O quê | Arquivo |
|---|---|
| Duração das cenas, textos, sistema de motion, câmeras, âncoras de match cut | `src/config/film.ts` |
| Cores e fontes (tokens da marca) | `src/config/brand.ts` |
| Qual imagem é usada em cada papel | `src/config/assets.json` |
| Cada cena | `src/scenes/S0X_*.tsx` |
| Componentes: câmera/foto, símbolo, wordmark, tipografia, grão | `src/components/` |

Câmeras são keyframes `{f, x, y, s, r}`: ponto da imagem original (px) no centro da tela,
escala e rotação. Os match cuts (`matchCut` em `src/lib/camera.ts`) calculam a câmera do
plano seguinte para que o logo apareça na mesma posição e no mesmo tamanho de tela.

## Timeline

| # | Cena | Tempo | Frames | O que acontece | Assets |
|---|---|---|---|---|---|
| 01 | Bárbara | 0,0–4,0s | 0–119 | Página creme; a foto abre como um obturador numa moldura 4:5 com muito espaço negativo. "Antes da marca, / existe o cuidado." → "Bárbara Fonseca / MÉDICA VETERINÁRIA". Sem logo. | barbaraArch |
| 02 | Cuidar | 4,0–8,2s | 120–245 | A moldura cresce até o formato de página. Mãos → cão → Bárbara com wipes verticais, uma frase por plano. A câmera entra no painel ameixa do consultório. | careHands, dogHeadTilt, barbaraPortrait |
| 03 | Nascimento | 8,2–11,8s | 246–353 | A cor do consultório vira o campo Ameixa. O contorno do símbolo se desenha em escala grande. O ponto final de "de cuidar." cresce e vira o campo Sálvia ("Aa"), e um círculo Creme abre o espaço do símbolo. | vetores do símbolo |
| 04 | Símbolo | 11,8–15,8s | 354–473 | Um único desenho visto por 3 câmeras em close (orelha → olho/focinho → língua), depois um recuo até o símbolo inteiro. A piscada é o último traço. "Uma identidade / com personalidade." | vetores do símbolo |
| 05 | Reveal físico | 15,8–21,0s | 474–629 | **Match cut** do símbolo para o relevo do caderno. Recuo até o foil; a capa "abre" (máscara com sombra) no brand book: logo → paleta → tipografia → plano geral. Push no wordmark da caixa. | notebook, brandBook |
| 06 | Sai do papel | 21,0–27,6s | 630–827 | **Match cuts** pelo logo: caixa → cartão (recuo) → símbolo do cartão → símbolo bordado no jaleco → wordmark do jaleco → wordmark da embalagem (a câmera desgira 16°). A embalagem sai pelo topo e revela o digital. | cards, coat, box, digital |
| 07 | Universo | 27,6–30,8s | 828–923 | Cortes secos de 8 a 12 frames, com a mesma "respiração" de escala: pessoa / marca / cão / aplicação alternados. | barbaraStudio, dogWalking, stationery, dogGolden, barbaraWorking, notebook, barbaraPortrait + vetores |
| 08 | Assinatura | 30,8–34,8s | 924–1043 | Fundo creme. O símbolo se desenha, o wordmark sobe linha a linha e o subtítulo fecha o tracking até o espaçamento oficial. Hold final. | vetores |

Ritmo (a partir da referência): abertura calma → tipografia → desenho do símbolo como ação
principal → hero físico lento → aplicações encadeadas → montagem rápida → desaceleração e
hold final longo. Sem fades entre cenas: as passagens são por cortes, máscaras, cor e match cuts.

## Sistema de motion

- **Tipografia (serif):** cada linha sobe de dentro de uma máscara, 24 frames, 5 frames de
  intervalo entre linhas, tracking de 0,05em → 0. A saída continua subindo. É a mesma regra em
  todas as frases.
- **Labels (sans, caixa alta):** o tracking fecha de 0,6em para 0,3em, com opacidade.
- **Fotos:** crop e escala com aspect ratio preservado. O "cover" é garantido por código
  (`clampCover`). Nenhum filtro; só um grão sutil (5%, overlay) para unir foto e vetor.
- **Easing:** três curvas só (`inOut`, `out`, `in`), em `src/lib/ease.ts`.

## Assets

### Usados
| Chave | Arquivo original | Uso |
|---|---|---|
| barbaraArch | Barbara/…11_14_27-10.png | abertura (S01/S02) |
| barbaraPortrait | Barbara/…11_14_20-2.png | "Criar confiança", push ameixa, fechamento S07 |
| barbaraStudio | Barbara/…11_14_19-1.png | S07 |
| barbaraWorking | Barbara/…11_14_32-15.png | S07 |
| careHands | Pets/…11_14_20-3.png | "Cuidar de perto" |
| dogHeadTilt | Pets/…11_14_23-6.png | "Entender cada história" |
| dogGolden | Pets/…11_14_22-5.png | S07 |
| dogWalking | Pets/…11_14_24-7.png | S07 |
| notebook | mockups/…11_14_32-16.png | relevo (match cut), documento fechado, S07 |
| brandBook | mockups/…11_14_25-8.png | brand book: logo, paleta, tipografia |
| cards | mockups/…11_14_26-9.png | cartões |
| coat | mockups/…11_14_30-13.png | jaleco |
| box | mockups/…11_14_29-12.png | embalagem |
| digital | mockups/…11_14_31-14.png | site + Instagram |
| stationery | mockups/…11_14_28-11.png | receituário (S07) |
| Brand/Ameixa sobre Creme.png | — | fonte da vetorização do símbolo e do wordmark |
| Brand/Ameixa sobre Sálvia.png, Creme sobre Ameixa.png | — | referência das combinações de cor usadas |

### Não usados (e por quê)
- `Barbara/…11_14_21-4.png`: o rosto é visivelmente diferente das outras fotos da Bárbara.
  Deixei de fora para manter a protagonista consistente.
- `Brand/image 1 [Vectorized].png`: é outro desenho de wordmark (tipografia e cor #521D34
  diferentes das versões oficiais), provavelmente uma versão antiga.
- `Brand/Sálvia sobre Creme.png`: combinação de baixo contraste para vídeo.
- `references/snapinsta-….mp4`: usado só como referência de ritmo.

### Vetorização do logo (não é redesenho)
O repositório não tem SVG. `tools/extract_brand_vectors.py` converte o PNG oficial em
cobertura, amplia 8× e vetoriza com potrace. Validação contra o original, em
`src/brand/generated/validation.json`: **IoU 99,4% no símbolo e 98,6% no wordmark**. A
diferença é só o antialiasing das bordas. O stroke reveal usa as linhas centrais como
**máscara**: o que aparece na tela é sempre o preenchimento oficial.

## Paleta (amostrada dos arquivos oficiais)
Ameixa `#653A47` · Creme `#F7F0E4` · Sálvia `#A0AD90` · Vinho escuro `#4B2C35` (este só
aparece no brand book). Observação: o brand book impresso indica Sálvia como `#A7B195`,
mas os PNGs oficiais usam `#A0AD90`. Segui os PNGs.

## Tipografia: ponto de atenção
Os arquivos de fonte da identidade **não estão no repositório**.
- **Montserrat 500** reproduz exatamente o "MÉDICA VETERINÁRIA" do logo.
- Para o serif editorial usei **Fraunces** (opsz 144, SOFT 50, peso 380), a correspondência
  mais próxima do serif dos mockups (site, receituário, "Aa" do brand book). Se houver a fonte
  oficial, basta trocar `FONTS.serif` em `src/config/brand.ts`.
- O logo **nunca é redigitado**: em todas as cenas ele vem do vetor oficial.
Ambas as fontes são OFL (licenças em `public/fonts/`).

## Licença do Remotion
O Remotion é gratuito para pessoas físicas e empresas de até 3 funcionários. Acima disso
exige licença de empresa (remotion.pro).
