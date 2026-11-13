Manchete gigante centralizada com a expressão-chave sublinhada, personagem recortado no pé e texto justificado em coluna estreita, sobre creme com patas fortes. Funciona como post estático ou slide de carrossel.

- **Você fornece:** a manchete, um texto curto e um recorte (PNG sem fundo) ou uma foto.
- As posições em `style` (left, top, width, height) são ponto de partida: mova, troque o lado, aumente ou diminua. É assim que um slide não fica igual ao anterior.
- Os textos dos exemplos são rascunhos para mostrar o layout: confirme com a Barbara antes de publicar.

```html
<section class="bf-slide bf-slide--creme">
  <i class="bf-pata bf-pata--g bf-pata--forte" style="right:-260px;top:-220px;transform:rotate(16deg)"></i>
  <i class="bf-pata bf-pata--m bf-pata--forte" style="left:-200px;top:330px;transform:rotate(-20deg)"></i>
  <i class="bf-pata bf-pata--m bf-pata--media" style="right:-150px;bottom:-120px;transform:rotate(8deg)"></i>
  <i class="bf-logo"></i><span class="bf-by">by barbara f tatsch</span>
  <span class="bf-handle">//@barbarafonsecavet</span>
  <h1 class="bf-livre bf-manchete bf-gasto bf-a-centro" style="left:60px;right:60px;top:200px">Nem todo cachorro precisa de <span class="bf-sub">antipulgas</span> o ano inteiro.</h1>
  <div class="bf-livre bf-col-40" style="left:80px;top:760px;display:flex;flex-direction:column;gap:40px">
    <p class="bf-texto bf-texto--menor bf-a-just">Depende da rotina dele: se vai pra rua, se convive com outros bichos, se já teve <b>pulga em casa</b>. Eu avalio antes de indicar.</p>
    <p class="bf-punch" style="font-size:44px">Pergunta na consulta.</p>
  </div>
  <img class="bf-personagem" src="RECORTE.png" alt="" style="right:40px;bottom:0;height:720px">
</section>
```