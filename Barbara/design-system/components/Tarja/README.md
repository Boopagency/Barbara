Faixa de destaque com uma caixa por linha: é a assinatura visual dos carrosséis da Barbara.

- **Você fornece:** o texto já quebrado em linhas, um `<span>` por linha, 2 a 4 linhas, até uns 26 caracteres cada.
- Parkinsans 400, 58 px, centralizada; uma ou duas palavras em `<b>` por tarja, nunca a linha inteira.
- `bf-tarja` (ameixa, texto creme) é o padrão. `bf-tarja--salvia` alterna no slide seguinte. `bf-tarja--creme` só sobre fundo `ameixa` ou `vinho`.
- Sobre foto, apoie a tarja numa área calma da imagem: no pé na capa, no topo nos slides de conteúdo. Nunca cubra olhos e focinho do animal.
- `bf-tarja--grande` (92 px, peso 700) é para capa de frase curta, até 14 caracteres por linha; `bf-tarja--esq` alinha à esquerda e ajusta cada caixa ao texto.
- `bf-etiqueta` é a versão de uma linha para nomear um item ("Pote extra de água").
- O par creme sobre `salvia` vem da arte original e tem contraste baixo (2,1:1): use só nesse corpo de 58 px, nunca em texto menor.

```html
<h2 class="bf-tarja">
  <span>Por que a maioria dos</span>
  <span>tutores <b>não sabe</b> cuidar</span>
  <span>dos próprios gatos?</span>
</h2>
```