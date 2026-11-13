Só texto: a frase de transição, ou um item com etiqueta.

- **Você fornece:** até 25 palavras. Uma ideia por slide.
- Sem foto, o slide respira: centralize na vertical (`bf-body--centro`) ou comece do topo com uma `bf-etiqueta`.

```html
<section class="bf-slide bf-slide--papel">
  <i class="bf-logo"></i><span class="bf-by">by barbara f tatsch</span>
  <span class="bf-handle">//@barbarafonsecavet</span>
  <div class="bf-body bf-body--centro">
    <p class="bf-texto">se o Hachiko fosse <b>meu paciente hoje</b>, três coisas iam ser diferentes na história dele.</p>
  </div>
</section>
```

```html
<section class="bf-slide bf-slide--ameixa">
  <i class="bf-pata bf-pata--bd"></i>
  <i class="bf-logo"></i><span class="bf-by">by barbara f tatsch</span>
  <span class="bf-handle">//@barbarafonsecavet</span>
  <div class="bf-body">
    <span class="bf-etiqueta">Pote extra de água</span>
    <p class="bf-texto">Um <b>pote</b> a mais em outro cômodo faz gato e cachorro beberem mais.</p>
    <p class="bf-punch">Mais água, menos risco de cálculo e cistite.</p>
  </div>
</section>
```