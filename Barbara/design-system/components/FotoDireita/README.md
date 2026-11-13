Foto em sangria com a tarja e o texto alinhados à direita, no pé. Para quebrar a sequência de slides alinhados à esquerda.

- **Você fornece:** a manchete, um texto curto e um recorte (PNG sem fundo) ou uma foto.
- As posições em `style` (left, top, width, height) são ponto de partida: mova, troque o lado, aumente ou diminua. É assim que um slide não fica igual ao anterior.
- Os textos dos exemplos são rascunhos para mostrar o layout: confirme com a Barbara antes de publicar.

```html
<section class="bf-slide bf-slide--foto">
  <img class="bf-fundo" src="FOTO.jpg" alt="">
  <div class="bf-scrim"></div>
  <i class="bf-logo"></i><span class="bf-by">by barbara f tatsch</span>
  <span class="bf-handle">//@barbarafonsecavet</span>
  <div class="bf-body bf-body--fim bf-a-dir" style="gap:30px">
    <h2 class="bf-tarja bf-tarja--salvia bf-gasto" style="align-items:flex-end">
      <span>Consulta de gato</span>
      <span>tem <b>outro ritmo.</b></span>
    </h2>
    <p class="bf-texto bf-texto--menor bf-col-60">Na vacina eu uso petisco pra distrair. A picada passa bem mais tranquila, pra ele e pra você.</p>
  </div>
</section>
```