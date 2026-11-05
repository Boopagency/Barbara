# Direção e validação

## Conceito

“Para quem faz a sua vida melhor.” Abertura com um pet em escala generosa, identidade original da Bárbara e uma mensagem curta. A página conduz ao agendamento através de quatro momentos: abertura, três atendimentos, apresentação do cuidado e contato. O foco comercial é solicitar um horário, com a confirmação feita pela profissional na conversa.

A referência anexada pelo usuário orientou a escala fotográfica e a organização modular. Os layouts de site presentes nos mockups e na apresentação do repositório não foram usados como modelo. A tipografia acompanha os materiais de marca das branches de motion/apresentação: Fraunces e Montserrat. Os retratos artificiais da Bárbara não são servidos.

## Decisões

- Conteúdo pré-renderizado em HTML para SEO, disponibilidade sem JavaScript e carga inicial leve.
- Um destino real de contato: Instagram conhecido. WhatsApp preparado, mas depende do número oficial.
- Sem coleta local de nome, telefone ou dados do pet. A conversa acontece diretamente no canal da profissional.
- Imagens WebP responsivas, com dimensões explícitas; hero prioritário; fotografia secundária e marca de apoio carregadas sob demanda.
- Fontes locais e ausência de embeds/rastreadores externos.
- Menu móvel, diálogo nativo com foco contido, Escape, retorno ao acionador, FAQs nativas, skip link e respeito a movimento reduzido.
- Barra móvel fixa de agendamento, ocultada quando o bloco de contato principal está visível.
- Fotos geradas de pets para campanha; sem falso retrato profissional, endereço, depoimento, estatística ou imagem de um suposto consultório real.

## Validação realizada — 05/10/2026

- `npm run build`: TypeScript e build de produção aprovados.
- `npm test`: 3 testes aprovados; ausência de telefone, mensagem por serviço e fallback seguro.
- Playwright/Chromium: 320, 390, 768, 1440 e 1920 px sem overflow horizontal, imagens quebradas, falhas de assets ou erros JavaScript.
- Fluxos: menu móvel; seleção de consulta, vacinação e domicílio; mudança de serviço; cópia de mensagem; Escape e restauração de foco; FAQ e animações de entrada.
- Auditoria axe: nenhuma violação encontrada nos conjuntos WCAG 2 A/AA e WCAG 2.1 AA avaliados, em desktop, mobile e diálogo de agendamento. Não é uma certificação completa de acessibilidade.
- Conteúdo e contato acessíveis com JavaScript desabilitado.
- Build com configuração fictícia isolada de teste: canonical, sitemap, indexação e links de WhatsApp sem JavaScript corretos; configuração de teste removida ao final, com novo build padrão `noindex`.
- Inspeção visual em desktop e mobile: composição, cortes de fotos e ausência de sobreposição do texto sobre o rosto do pet no mobile.

Não foi feita publicação, confirmação de agendamento real, medição de conversão nem teste em aparelhos físicos/Safari. Os screenshots em `docs/` mostram a versão revisada.

## Reproduzir os testes de navegador

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

O teste sobe um servidor local temporário e o encerra ao final. Em ambientes com Chromium preinstalado, `BROWSER_EXECUTABLE_PATH` pode apontar para ele; `BROWSER_ARGS` aceita um array JSON de argumentos específicos do ambiente. Essas opções são exclusivas dos testes, não do site. Capturas locais ficam em `.playwright/`, fora do Git.

## Pendências de dados

WhatsApp e domínio final. Endereço e identificação profissional podem ser adicionados quando confirmados; a versão atual não os inventa. O CTA já funciona via Instagram e deixa claro que o horário só é confirmado na conversa.
