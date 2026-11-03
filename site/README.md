# Site · Bárbara Fonseca, Médica Veterinária

Site estático (HTML + CSS + JS puro, sem build). Para publicar, suba a pasta `site/` em qualquer hospedagem (Vercel, Netlify, Hostinger…).

## Antes de publicar
- Edite o `CONFIG` no topo de `script.js` com os dados reais (`email`, `instagram`, `address`, `crmv`). Os contatos do HTML são preenchidos a partir dele.
- Ligue a planilha de leads (abaixo).

## Formulário de lead (site e link da bio)
Não há mais agenda online: todo botão de agendar abre um formulário curto e a conversa segue no WhatsApp com a Bárbara.

- `lead.js` cria o formulário, a política de privacidade e o aviso de cookies nas duas páginas.
- Qualquer elemento com `data-lead="agendar"` (ou `"conhecer"`) abre o formulário. `data-servico="Vacina e vermífugo"` já marca o que a pessoa precisa. `/#agendar` abre o formulário direto.
- Perguntas: nome, WhatsApp, o que precisa, bairro, para quando e aceite de privacidade (LGPD).
- Ao enviar, o lead vai para a planilha (aba **Site** ou **Bio**) e o WhatsApp abre com as respostas e a origem.

### Planilha (Google Sheets)
1. Crie uma planilha no Google Sheets > Extensões > Apps Script > cole `planilha-leads.gs` (na raiz do repositório) > salvar.
2. Implantar > Nova implantação > App da Web. Executar como: **Eu**. Quem pode acessar: **Qualquer pessoa**. Implantar e autorizar.
3. Cole a URL que termina em `/exec` em `PLANILHA`, no topo de `lead.js`. Enquanto estiver vazio, o formulário só abre o WhatsApp.

As abas "Site" e "Bio" são criadas sozinhas no primeiro lead de cada uma.

### Origem (UTM)
Site: https://www.barbarafonsecavet.com.br · Link na bio: https://bio.barbarafonsecavet.com.br (abre `/links`, mantendo as UTMs)

- **Bio do Instagram (orgânico):** `https://bio.barbarafonsecavet.com.br` (sem UTM já conta como instagram/bio)
- **Anúncio no link da bio:** `https://bio.barbarafonsecavet.com.br/?utm_source=instagram&utm_medium=paid&utm_campaign=NOME` (no Meta Ads dá para usar `utm_campaign={{campaign.name}}`)
- **Site pela busca do Google:** automático, sem UTM (detecta que a pessoa veio do Google).
- **Site pelo Google Ads:** automático pelo `gclid` (auto-tagging ligado no Google Ads). Para ter o nome da campanha, use o modelo de acompanhamento `{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}`.
- **Site pelo Perfil da Empresa no Google (Maps):** cadastre o site como `https://www.barbarafonsecavet.com.br/?utm_source=google&utm_medium=perfil-empresa`.
- Site sem UTM e sem vir do Google conta como `direto`.

Regra: `utm_medium` = `paid`, `cpc`, `ppc`, `ads` ou `anuncio` conta como anúncio; o resto é orgânico. Mensagem que chega para a Bárbara:

    Olá, Bárbara! Vi seu anúncio e quero agendar um atendimento para o meu pet.

    • Nome: Ana
    • Preciso de: Vacina e vermífugo
    • Para quando: Esta semana
    • Bairro: Batel

    Origem: site · anúncio (google · cpc · vacina-nov)

### Cookies
Aviso na primeira visita, com a escolha guardada no navegador. Pixel da Meta ou GA4 só devem carregar com o aceite (`localStorage bf-cookies = "sim"`).

## Link na bio (`bio.barbarafonsecavet.com.br`)
Página `links.html`, servida em `/links` e no subdomínio `bio.` (redirecionamento no `vercel.json`): vídeo, o que a Bárbara faz e os botões **Quero agendar** e **Quero conhecer**. Não leva para o site, para não perder a origem.
Vídeo: suba em `assets/video/barbara.mp4` (vertical 9:16, H.264, até ~8 MB). Sem o arquivo aparece a foto dela de jaleco e o botão de som some.

## Estrutura
- `index.html`: página + logotipo vetorizado embutido
- `links.html`: link na bio
- `lead.js`: formulário de lead, privacidade e cookies (site e bio)
- `styles.css`: tokens da marca (Ameixa #653A47, Creme #F7F0E4, Sálvia #A0AD90)
- `script.js`: contatos, menu e animações do site
- `assets/fonts`: Parkinsans (títulos) e Onest (texto), auto-hospedadas
- `assets/img`: fotos otimizadas em WebP
