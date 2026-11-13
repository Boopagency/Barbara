Slide de conteúdo sobre foto: a afirmação em tarja no topo e a explicação em texto corrido no pé.

- **Você fornece:** foto vertical com o assunto no centro, a afirmação (até 3 linhas) e a explicação (até 30 palavras).
- Alterne `bf-tarja` e `bf-tarja--salvia` entre slides seguidos.
- No texto do pé: `<b>` na palavra-chave e `<u>` na recomendação final. `.bf-scrim` é obrigatório para o texto ler.

```html
<section class="bf-slide bf-slide--foto">
  <img class="bf-fundo" src="FOTO.jpg" alt="">
  <div class="bf-scrim"></div>
  <i class="bf-logo"></i><span class="bf-by">by barbara f tatsch</span>
  <span class="bf-handle">//@barbarafonsecavet</span>
  <div class="bf-body bf-body--entre">
    <h2 class="bf-tarja bf-tarja--salvia">
      <span><b>Não</b> realizam check-up</span>
      <span>uma vez por ano</span>
      <span>mesmo com ele ótimo.</span>
    </h2>
    <p class="bf-texto">Os gatos <b>escondem dor</b> muito <u>bem</u>, e o exame de sangue mostra o rim mudando antes de qualquer sinal.<br><u>Idoso vai mais vezes.</u></p>
  </div>
</section>
```