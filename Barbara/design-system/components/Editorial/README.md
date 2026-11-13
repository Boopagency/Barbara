Estética editorial, de capa de revista: uma palavra em tipo gigante com o bicho recortado na frente, letras pequenas de revista nos cantos, filete, faixa no pé e foto emoldurada.

- **Você fornece:** a palavra gigante (uma só, até 7 letras por linha), o recorte ou a foto e a frase da faixa.
- `bf-gigante` (`--m` 210 px, `--g` 360 px, `--fino` leve) fica atrás do recorte; o bicho cobre parte das letras, sem esconder a palavra.
- `bf-micro` nos rótulos curtos (série, tema, cidade e data); `bf-regua` como filete.
- `bf-faixa-pe` (`--creme`, `--ameixa`; sálvia é o padrão) leva a frase que puxa o próximo slide ou o resumo do estático.
- `bf-quadro` emoldura a foto com borda creme ou sálvia de 8 px.
- `bf-pagina` ("02/08") no canto superior direito, igual em todos os slides do carrossel.

- **Você fornece:** a manchete, um texto curto e um recorte (PNG sem fundo) ou uma foto.
- As posições em `style` (left, top, width, height) são ponto de partida: mova, troque o lado, aumente ou diminua. É assim que um slide não fica igual ao anterior.
- Os textos dos exemplos são rascunhos para mostrar o layout: confirme com a Barbara antes de publicar.

```html
<section class="bf-slide bf-slide--salvia">
  <i class="bf-logo bf-ink"></i><span class="bf-by bf-ink">by barbara f tatsch</span>
  <span class="bf-handle">//@barbarafonsecavet</span>
  <div class="bf-livre bf-ink" style="left:80px;top:178px;right:80px;display:flex;justify-content:space-between"><span class="bf-micro">Nº 07 · Longevidade</span><span class="bf-micro">Curitiba, 2026</span></div>
  <h1 class="bf-gigante bf-gigante--g" style="left:56px;top:250px;color:var(--bf-creme)">Viver</h1>
  <h1 class="bf-gigante bf-gigante--g" style="left:56px;top:520px;color:var(--bf-creme)">mais</h1>
  <img class="bf-personagem" src="RECORTE.png" alt="" style="right:120px;top:300px;height:760px">
  <div class="bf-faixa-pe bf-faixa-pe--ameixa"><span class="bf-micro">Um remédio em teste nos EUA</span><p class="bf-punch">Já existe remédio pra cachorro viver mais?</p></div>
</section>
```