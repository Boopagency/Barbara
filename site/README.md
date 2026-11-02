# Site · Bárbara Fonseca, Médica Veterinária

Site estático (HTML + CSS + JS puro, sem build). Para publicar, suba a pasta `site/` em qualquer hospedagem (Vercel, Netlify, Hostinger…).

## Antes de publicar
Edite o objeto `CONFIG` no topo de `script.js`:

- `email`, `instagram`, `address`, `crmv`: dados reais
- `schedule`: horários de atendimento por dia da semana
- `blocked`: feriados ou horários já ocupados (`"2026-12-25"` ou `"2026-10-08 14:00"`)

Os textos de contato no HTML são preenchidos automaticamente a partir do `CONFIG`.

**Depoimentos:** os depoimentos em `index.html` são exemplos. Troque por avaliações reais.

## Agendamento
Todo botão com `data-book` abre o agendamento (`data-book="vacina"` já abre com o serviço escolhido).
Fluxo: serviço → dia/horário → dados do pet e do tutor → resumo → abre o WhatsApp com a mensagem pronta.
A lista de serviços fica em `SERVICES`, no `script.js`.

## Link na bio (`/links`)
Página `links.html`, servida em `/links`. Vídeo + "Quero agendar / Quero conhecer" + "O que eu resolvo".

- **Vídeo:** suba em `assets/video/barbara.mp4` (vertical 9:16, H.264, até ~8 MB). Sem o arquivo aparece a foto e o botão de som some.
- **Bio do Instagram (orgânico):** `https://DOMINIO/links?utm_source=instagram&utm_medium=bio`
- **Anúncios:** `https://DOMINIO/links?utm_source=instagram&utm_medium=paid&utm_campaign=NOME`
  (no Meta Ads dá para usar `utm_campaign={{campaign.name}}&utm_content={{ad.name}}`)
- **Stories (orgânico):** `utm_medium=stories`
- `&aba=conhecer` abre a página já na aba "Quero conhecer".

Regra: `utm_medium` = `paid`, `cpc`, `ppc`, `ads` ou `anuncio` conta como anúncio; o resto é orgânico. Sem UTM, `/links` conta como bio.
As UTMs seguem para o site e toda mensagem de WhatsApp (da página e do agendamento) termina com, por exemplo,
`Origem: anúncio · instagram · paid · vacina-nov`, assim a Bárbara sabe de onde veio cada contato.
`/#agendar-vacina` (ou `consulta`, `checkup`, `domiciliar`, `filhote`, `senior`, `retorno`) abre o agendamento já com o serviço.

## Estrutura
- `index.html`: página + logotipo vetorizado embutido
- `styles.css`: tokens da marca (Ameixa #653A47, Creme #F7F0E4, Sálvia #A0AD90)
- `script.js`: agenda, menu, carrossel e animações
- `assets/fonts`: Parkinsans (títulos) e Onest (texto), auto-hospedadas
- `assets/img`: fotos otimizadas em WebP
