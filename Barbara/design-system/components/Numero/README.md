Um item de lista por slide, com o numeral gigante como figura.

- **Você fornece:** o número, o título em caixa-alta (até 10 palavras, o essencial em `<b>`) e uma linha de apoio.
- Dentro do carrossel, todos os números usam o mesmo fundo e o numeral no mesmo lugar. Troque o fundo de um carrossel pro outro.
- Em fundo `salvia` ou `creme`, o texto usa `.bf-ink` e o numeral `ameixa`.

```html
<section class="bf-slide bf-slide--ameixa">
  <i class="bf-pata bf-pata--td"></i>
  <i class="bf-logo"></i><span class="bf-by">by barbara f tatsch</span>
  <span class="bf-handle">//@barbarafonsecavet</span>
  <div class="bf-body bf-body--centro">
    <span class="bf-numero">3</span>
    <h2 class="bf-titulo bf-titulo--caixa"><b>Lírio no vaso,</b><br>gato em risco.</h2>
    <p class="bf-legenda">Lamber o pólen já pode causar lesão grave nos rins. Ligue para <b>um médico veterinário</b> de sua confiança.</p>
  </div>
</section>
```