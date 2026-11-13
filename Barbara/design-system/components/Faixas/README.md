Três faixas horizontais (ameixa, creme, sálvia) para uma lista de três itens.

- **Você fornece:** exatamente três itens, cada um com número em `<b>` e até 14 palavras.
- A ordem das cores é fixa. Para mais itens, use um slide `Numero` por item.
- O texto creme sobre a faixa `salvia` vem da arte original e tem contraste baixo: mantenha os 50 px.

```html
<section class="bf-slide bf-slide--ameixa">
  <div class="bf-faixas">
    <div class="bf-faixa bf-faixa--ameixa"><i class="bf-pata bf-pata--p" style="right:120px;bottom:-250px"></i><p class="bf-texto"><b>1.</b> prevenção contra o verme do coração, que passa pela picada do mosquito.</p></div>
    <div class="bf-faixa bf-faixa--creme"><p class="bf-texto"><b>2.</b> check-up com exame de sangue, mesmo ele parecendo ótimo.</p></div>
    <div class="bf-faixa bf-faixa--salvia"><i class="bf-pata bf-pata--p" style="right:120px;bottom:-250px"></i><p class="bf-texto"><b>3.</b> espetinho com palito, nunca. O palito pode furar o estômago ou o intestino.</p></div>
  </div>
  <i class="bf-logo"></i><span class="bf-by">by barbara f tatsch</span>
  <span class="bf-handle">//@barbarafonsecavet</span>
</section>
```