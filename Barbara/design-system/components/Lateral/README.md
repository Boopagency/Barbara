Manchete alinhada à esquerda em coluna, personagem sangrando pela direita, texto pequeno embaixo. Fundo `vinho` com patas suaves.

- **Você fornece:** a manchete, um texto curto e um recorte (PNG sem fundo) ou uma foto.
- As posições em `style` (left, top, width, height) são ponto de partida: mova, troque o lado, aumente ou diminua. É assim que um slide não fica igual ao anterior.
- Os textos dos exemplos são rascunhos para mostrar o layout: confirme com a Barbara antes de publicar.

```html
<section class="bf-slide bf-slide--vinho">
  <i class="bf-pata bf-pata--suave" style="left:300px;top:-180px;transform:rotate(-12deg)"></i>
  <i class="bf-pata bf-pata--m bf-pata--suave" style="left:420px;bottom:-200px;transform:rotate(20deg)"></i>
  <i class="bf-logo"></i><span class="bf-by">by barbara f tatsch</span>
  <span class="bf-handle">//@barbarafonsecavet</span>
  <div class="bf-livre" style="left:80px;top:200px;width:580px;display:flex;flex-direction:column;gap:44px">
    <h1 class="bf-manchete bf-manchete--m bf-gasto">Filhote só pisa na rua com a vacina completa.</h1>
    <p class="bf-texto bf-texto--menor">Até a última dose fazer efeito, ele ainda não tá protegido contra <b>parvovirose</b> e <b>cinomose</b>. Passear no colo pode.</p>
  </div>
  <img class="bf-personagem" src="RECORTE.png" alt="" style="right:-30px;bottom:0;height:1020px">
</section>
```