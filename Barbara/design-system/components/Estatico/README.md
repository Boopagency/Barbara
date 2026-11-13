Post estático: manchete média, explicação em duas frases e personagem no canto. Sozinho no feed, sem "arrasta".

- **Você fornece:** a manchete, um texto curto e um recorte (PNG sem fundo) ou uma foto.
- As posições em `style` (left, top, width, height) são ponto de partida: mova, troque o lado, aumente ou diminua. É assim que um slide não fica igual ao anterior.
- Os textos dos exemplos são rascunhos para mostrar o layout: confirme com a Barbara antes de publicar.

```html
<section class="bf-slide bf-slide--salvia">
  <i class="bf-pata bf-pata--m bf-pata--media" style="right:60px;top:120px;transform:rotate(14deg);color:var(--bf-ameixa)"></i>
  <i class="bf-logo"></i><span class="bf-by">by barbara f tatsch</span>
  <span class="bf-handle">//@barbarafonsecavet</span>
  <div class="bf-livre bf-ink" style="left:80px;top:200px;width:700px;display:flex;flex-direction:column;gap:28px">
    <h1 class="bf-manchete bf-manchete--m bf-gasto">Dois gatos em casa?</h1>
    <p class="bf-texto">Uma caixa de areia <b>pra cada um</b>, mais uma. E os potes de comida longe da caixa.</p>
    <p class="bf-texto bf-texto--menor">Gato não gosta de dividir banheiro nem de comer perto dele.</p>
  </div>
  <img class="bf-personagem" src="RECORTE.png" alt="" style="right:0;bottom:0;height:640px">
</section>
```