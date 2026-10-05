# Site · Bárbara Fonseca, Médica Veterinária

Site estático (HTML + CSS + JS puro, sem build). Para publicar, suba a pasta `site/` em qualquer hospedagem (Vercel, Netlify, Hostinger…).

## Antes de publicar
Edite o objeto `CONFIG` no topo de `script.js`:

- `whatsapp`, `phoneDisplay`, `email`, `instagram`, `address`, `crmv`: dados reais
- `schedule`: horários de atendimento por dia da semana
- `blocked`: feriados ou horários já ocupados (`"2026-12-25"` ou `"2026-10-08 14:00"`)

Os textos de contato no HTML são preenchidos automaticamente a partir do `CONFIG`.

**Depoimentos:** os depoimentos em `index.html` são exemplos. Troque por avaliações reais.

## Agendamento
Todo botão com `data-book` abre o agendamento (`data-book="vacina"` já abre com o serviço escolhido).
Fluxo: serviço → dia/horário → dados do pet e do tutor → resumo → abre o WhatsApp com a mensagem pronta.
A lista de serviços fica em `SERVICES`, no `script.js`.

## Estrutura
- `index.html`: página + logotipo vetorizado embutido
- `styles.css`: tokens da marca (Ameixa #653A47, Creme #F7F0E4, Sálvia #A0AD90)
- `script.js`: agenda, menu, carrossel e animações
- `assets/fonts`: Parkinsans (títulos) e Onest (texto), auto-hospedadas
- `assets/img`: fotos otimizadas em WebP
