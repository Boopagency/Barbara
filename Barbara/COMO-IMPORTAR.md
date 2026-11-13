# Barbara Fonseca · pacote de design e posts (nov-dez/2026)

Tudo o que foi feito para a Barbara num lugar só, pronto para levar para outra conta do Claude (ou para o ChatGPT, o Figma ou o Canva).

## O que tem aqui

| Pasta ou arquivo | O que é |
| --- | --- |
| `DESIGN-SYSTEM-BARBARA-FONSECA.md` | O design system em um arquivo só: voz, regras, modelos de slide e a folha de estilo inteira. É o que se cola numa conversa nova. |
| `design-system/` | Os arquivos do design system: `README.md` (regras da marca), `tokens.json` (cores, fontes, espaços), `components/` (cada modelo de slide com prévia e instruções), `assets/` (logos, fotos da Barbara e recortes sem fundo), `fonts/` (Parkinsans). |
| `posts/png/` | Os 13 posts prontos, um PNG de 1080 × 1350 por slide, numerados pela data. |
| `posts/html/` | Os mesmos 13 posts em HTML editável (abre no navegador), com `slides.css` e a pasta `imagens/`. |

Os espaços listrados nos posts são fotos que ainda faltam (a lista está no fim deste arquivo).

## Levar para outra conta do Claude

### Para criar posts novos com a mesma cara

1. Abra uma conversa nova no Claude da outra conta.
2. Anexe `DESIGN-SYSTEM-BARBARA-FONSECA.md` e diga: "Este é o design system da Barbara Fonseca. Use para criar carrosséis e posts estáticos."
3. Se quiser as fotos e os recortes, anexe também os arquivos de `design-system/assets/`.

### Para recriar o design system dentro do Claude Design

1. Na outra conta, envie esta pasta inteira (compactada em .zip) numa conversa do Claude Code ou do Claude com acesso a arquivos.
2. Peça: "Crie um design system a partir da pasta `design-system/`: o README.md é o manual da marca, o tokens.json tem as cores e fontes, e cada pasta em components/ é um modelo de slide. Suba as imagens de assets/ como arquivos do design system."
3. Depois, para os posts: "Monte um canvas com os arquivos de `posts/html/`, um quadro por post, usando esse design system."

### Para editar fora do Claude

- **Figma:** arraste os PNGs de `posts/png/`, ou importe os HTMLs de `posts/html/` com um plugin de HTML para Figma (por exemplo html.to.design). Com o plugin os textos vêm editáveis, mas a textura gasta e o grão podem precisar de ajuste.
- **Canva ou Instagram:** use os PNGs direto.

## Compartilhar o link já resolve?

Em parte. O link do design system (https://claude.ai/artifact/PoWLU2hb7DEdhV77VsK1ec) e o do canvas (https://claude.ai/artifact/JhteyMF2s2Z5ucRgXujUy1) deixam a outra conta **ver** tudo, desde que você compartilhe pelo botão Share de cada um. Para a outra conta **trabalhar em cima**, este pacote é o caminho seguro, porque leva os arquivos em si.

## Fotos que ainda faltam

1. Viagem (01/12), capa: cachorro ou gato dentro da caixa de transporte, ao lado de uma mala.
2. Remédio pra viver mais (03/12), capa: cachorro idoso de focinho branco, de frente, fundo liso (para recortar).
3. Certificado (15/12), capa: o certificado de coragem sendo entregue na mão do tutor, com o paciente atrás.
4. Certificado, slide 2: carteirinhas de vacina com o nome da Barbara, de perto.
5. Certificado, slide 4: tutor com o pet no colo depois da vacina.
6. Certificado, slide 5: certificado preso na geladeira de um tutor.
7. Fogos (19/12), slide 3: cachorro embaixo de uma coberta ou da mesa, só o focinho aparecendo.
8. Fogos, slide 6: gato escondido no armário, só os olhos aparecendo.

## Cuidados

- As fotos do mutirão (`assets/Fotos/mutirao-*`) mostram rostos de voluntários: só publicar com autorização.
- Os trechos de saúde dos posts passam pela Barbara antes de publicar.
