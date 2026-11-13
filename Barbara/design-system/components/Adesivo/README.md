Estética de adesivo: mancha orgânica atrás do bicho recortado, recorte com contorno creme, uma palavra escrita à mão, onda atravessando o slide e mini adesivos.

- **Você fornece:** um recorte (PNG sem fundo), a manchete e a palavra que vai à mão.
- `bf-mancha` (formas `--2`, `--3`; cores `--salvia`, `--rosa`, `--creme`, `--ameixa`) fica atrás do recorte e é um pouco maior que ele.
- `bf-contorno` no `<img>` do recorte desenha a borda creme de adesivo.
- `bf-mao` numa palavra da manchete (uma por slide) ou `bf-mao-solta` para um comentário curto solto no slide, em Caveat.
- `bf-onda` cruza o slide atrás de tudo; no máximo uma.
- `bf-adesivo` (`--pata`, `--coracao`, `--brilho`, `--alerta`, `--flor`), de 2 a 4 por slide, girados, perto do recorte. Nunca emoji.
- `bf-marca` destaca uma palavra do texto com fundo sálvia.
- Use em um ou dois slides por carrossel, de preferência na capa. O resto do carrossel segue limpo, pra o adesivo continuar chamando atenção.

- **Você fornece:** a manchete, um texto curto e um recorte (PNG sem fundo) ou uma foto.
- As posições em `style` (left, top, width, height) são ponto de partida: mova, troque o lado, aumente ou diminua. É assim que um slide não fica igual ao anterior.
- Os textos dos exemplos são rascunhos para mostrar o layout: confirme com a Barbara antes de publicar.

```html
<section class="bf-slide bf-slide--salvia">
  <i class="bf-onda" style="left:-200px;bottom:120px;--bf-onda-cor:var(--bf-creme)"></i>
  <i class="bf-logo bf-ink"></i><span class="bf-by bf-ink">by barbara f tatsch</span>
  <span class="bf-handle bf-ink">//@barbarafonsecavet</span>
  <h1 class="bf-livre bf-manchete bf-gasto bf-a-centro bf-ink" style="left:60px;right:60px;top:190px">Isso pode parecer <span class="bf-mao bf-mao--creme">fofo</span></h1>
  <i class="bf-mancha bf-mancha--rosa" style="left:180px;top:430px;width:720px;height:640px"></i>
  <img class="bf-personagem bf-contorno" src="RECORTE.png" alt="" style="left:300px;top:420px;height:620px">
  <i class="bf-adesivo bf-adesivo--alerta bf-adesivo--ameixa" style="left:150px;top:520px;transform:rotate(-12deg)"></i>
  <i class="bf-adesivo bf-adesivo--coracao bf-adesivo--creme bf-adesivo--p" style="right:170px;top:470px;transform:rotate(14deg)"></i>
  <i class="bf-adesivo bf-adesivo--brilho bf-adesivo--creme" style="right:150px;top:880px"></i>
  <p class="bf-livre bf-texto bf-a-centro bf-ink" style="left:80px;right:80px;bottom:150px;z-index:4">mas pode virar um <span class="bf-marca">problema</span> nele.</p>
</section>
```