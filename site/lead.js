/* ==========================================================
   Formulário de lead, usado no site e no link da bio.
   <script src="lead.js" data-pagina="site|bio" defer></script>

   Qualquer elemento com data-lead abre o formulário:
     data-lead="agendar" | "conhecer"   (muda o título e a mensagem)
     data-servico="Vacina e vermífugo"  (já marca o que a pessoa precisa)
   Ao enviar: grava na planilha (aba "Site" ou "Bio", com a origem) e abre
   o WhatsApp com as respostas e "Vim pelo seu Instagram/site". Também cria o aviso de cookies e a
   política de privacidade (qualquer data-privacy abre).
   ========================================================== */
(() => {
  const WHATSAPP = "5541987269000";   // mesmo número do CONFIG em script.js
  /* URL do Apps Script da planilha (termina em /exec). Vazio = não salva, só abre o WhatsApp. */
  const PLANILHA = "https://script.google.com/macros/s/AKfycbymSGXTdbaV4VChAdw70yyF9ZaoRHx9XUv1nkXsXtLWtwK4faiHB0ELa7-v7DJCWB7Ngw/exec";

  const PAGINA = document.currentScript.dataset.pagina === "bio" ? "bio" : "site";
  const SERVICOS = ["Consulta", "Vacina e vermífugo", "Check-up", "Atendimento em casa", "Filhote", "Pet idoso", "Retorno", "Ainda não sei"];
  const INTENCAO = {
    agendar: { titulo: "Vamos agendar", frase: "quero agendar um atendimento para o meu pet" },
    conhecer: { titulo: "Vamos conversar", frase: "quero conhecer melhor o seu trabalho" },
  };
  const $ = (s, el = document) => el.querySelector(s);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sem storage */ } },
  };

  /* ---------- origem (UTM) ----------
     Sem UTM: bio = instagram/bio; site com gclid (Google Ads) = google/cpc;
     site vindo da busca do Google = google/organico; o resto = direto.
     utm_medium paid, cpc, ppc, ads ou anuncio = anúncio; o resto é orgânico. */
  const q = new URLSearchParams(location.search);
  const utm = Object.fromEntries([...q].filter(([k]) => k.startsWith("utm_")));
  if (!utm.utm_source && !utm.utm_medium) {
    Object.assign(utm,
      PAGINA === "bio" ? { utm_source: "instagram", utm_medium: "bio" }
      : q.has("gclid") ? { utm_source: "google", utm_medium: "cpc" }
      : /^https?:\/\/(www\.)?google\./.test(document.referrer) ? { utm_source: "google", utm_medium: "organico" }
      : { utm_source: "direto" });
  }
  const paid = /paid|cpc|ppc|^ads?$|anuncio/i.test(utm.utm_medium || "");
  const tipo = paid ? "anúncio" : "orgânico";
  const via = PAGINA === "bio" ? "Vim pelo seu Instagram" : "Vim pelo seu site";

  /* ---------- HTML (estilos do .book em styles.css) ---------- */
  const close = `<button type="button" class="book__close" data-close aria-label="Fechar"><svg><use href="#i-close"/></svg></button>`;
  const brand = (kicker, title, id, attr = "") => `
    <div class="book__brand">
      <svg aria-hidden="true"><use href="#dog"/></svg>
      <div><p class="book__kicker">${kicker}</p><h2 id="${id}" ${attr}>${title}</h2></div>
    </div>`;
  document.body.insertAdjacentHTML("beforeend", `
<dialog class="book" aria-labelledby="lead-title" data-lead-dialog>
  <form class="book__form">
    <header class="book__head">${brand("Leva menos de 30 segundos", "Vamos agendar", "lead-title", "data-lead-title")}${close}</header>
    <div class="book__body">
      <div class="fields">
        <label class="field"><span>Seu nome</span><input name="nome" autocomplete="name" required maxlength="80" pattern=".*\\S.*" placeholder="Como posso te chamar?"></label>
        <label class="field"><span>Seu WhatsApp</span><input name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" required placeholder="(41) 9 0000-0000" pattern="\\(\\d{2}\\) \\d{4,5}-\\d{4}" title="DDD + número"></label>
        <label class="field"><span>O que você precisa?</span>
          <select name="servico" required><option value="" selected disabled>Escolha</option>${SERVICOS.map((s) => `<option>${s}</option>`).join("")}</select>
        </label>
        <label class="field"><span>Seu bairro</span><input name="bairro" autocomplete="address-level3" required maxlength="60" pattern=".*\\S.*" placeholder="Ex.: Batel"></label>
        <fieldset class="field field--full">
          <legend>Para quando?</legend>
          <div class="seg seg--3">
            <label><input type="radio" name="urgencia" value="Hoje" required><span>Hoje</span></label>
            <label><input type="radio" name="urgencia" value="Esta semana"><span>Esta semana</span></label>
            <label><input type="radio" name="urgencia" value="Sem pressa"><span>Sem pressa</span></label>
          </div>
        </fieldset>
        <p class="lead__alert field--full" role="note">Se for emergência (sangramento, convulsão, suspeita de envenenamento ou falta de ar), procure agora um pronto-atendimento veterinário 24h.</p>
        <label class="lead__ok field--full">
          <input type="checkbox" name="aceite" required>
          <span>Autorizo o uso dos meus dados para a Bárbara falar comigo, conforme a <button type="button" class="linkish" data-privacy>política de privacidade</button>.</span>
        </label>
      </div>
    </div>
    <footer class="book__foot">
      <button type="submit" class="btn btn--plum btn--lg"><svg aria-hidden="true"><use href="#i-chat"/></svg>Continuar no WhatsApp</button>
    </footer>
  </form>
</dialog>

<!-- Política de privacidade (LGPD). Revisar com o jurídico antes de publicar. -->
<dialog class="book" aria-labelledby="priv-title" data-privacy-dialog>
  <div class="book__form">
    <header class="book__head">${brand("LGPD", "Política de privacidade", "priv-title")}${close}</header>
    <div class="book__body privacy">
      <h3>Quem cuida dos seus dados</h3>
      <p>Bárbara Fonseca, médica veterinária, Curitiba/PR. Contato: WhatsApp (41) 9 8726-9000.</p>
      <h3>O que coletamos</h3>
      <p>Quando você preenche o formulário: nome, WhatsApp, bairro, o que o seu pet precisa e para quando. Também registramos de onde você chegou (por exemplo, o perfil do Instagram, o site ou um anúncio), a partir do link que você clicou.</p>
      <h3>Para quê</h3>
      <p>Responder você, agendar o atendimento e entender quais canais trazem contatos. Não vendemos nem repassamos seus dados para terceiros.</p>
      <h3>Onde ficam</h3>
      <p>Numa planilha Google de acesso restrito e na conversa do WhatsApp.</p>
      <h3>Cookies</h3>
      <p>Guardamos no seu navegador apenas a sua escolha sobre cookies. Ferramentas de medição só são ativadas se você aceitar.</p>
      <h3>Por quanto tempo e seus direitos</h3>
      <p>Mantemos os dados enquanto forem necessários para o atendimento. Você pode pedir acesso, correção ou exclusão a qualquer momento pelo WhatsApp.</p>
    </div>
  </div>
</dialog>

<div class="cookie" role="region" aria-label="Aviso de cookies" hidden data-cookie>
  <p>Usamos cookies para entender como você chegou aqui e melhorar o atendimento. <button type="button" class="linkish" data-privacy>Saiba mais</button></p>
  <div class="cookie__btns">
    <button type="button" class="btn btn--ghost" data-cookie-choice="nao">Recusar</button>
    <button type="button" class="btn btn--plum" data-cookie-choice="sim">Aceitar</button>
  </div>
</div>`);

  /* ---------- abrir ---------- */
  const dlg = $("[data-lead-dialog]");
  const form = $("form", dlg);
  const privDlg = $("[data-privacy-dialog]");
  let intencao = "agendar";

  function open(lead, servico) {
    intencao = INTENCAO[lead] ? lead : "agendar";
    $("[data-lead-title]", dlg).textContent = INTENCAO[intencao].titulo;
    form.servico.value = SERVICOS.includes(servico) ? servico : "";
    dlg.showModal();
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-lead], [data-privacy]");
    if (!t) return;
    e.preventDefault();
    if ("privacy" in t.dataset) privDlg.showModal();
    else open(t.dataset.lead, t.dataset.servico);
  });
  if (location.hash === "#agendar") open("agendar");

  [dlg, privDlg].forEach((d) => {
    $("[data-close]", d).addEventListener("click", () => d.close());
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  });

  /* ---------- enviar: planilha + WhatsApp ---------- */
  const phone = form.whatsapp;
  phone.addEventListener("input", () => {
    const d = phone.value.replace(/\D/g, "").slice(0, 11);
    phone.value = d.length > 7 ? `(${d.slice(0, 2)}) ${d.slice(2, -4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    const lead = { pagina: PAGINA, intencao, nome: f.nome.trim(), whatsapp: f.whatsapp, servico: f.servico, urgencia: f.urgencia, bairro: f.bairro.trim(), tipo, ...utm };
    if (PLANILHA) navigator.sendBeacon(PLANILHA, JSON.stringify(lead));

    const text = [
      `Olá, Bárbara! ${via} e ${INTENCAO[intencao].frase}.`,
      "",
      `• Nome: ${lead.nome}`,
      `• Preciso de: ${lead.servico}`,
      `• Para quando: ${lead.urgencia}`,
      `• Bairro: ${lead.bairro}`,
    ].join("\n");
    dlg.close();
    form.reset();
    location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  });

  /* ---------- cookies ----------
     Pixel da Meta / GA4: carregar só quando localStorage "bf-cookies" === "sim". */
  const cookie = $("[data-cookie]");
  cookie.hidden = !!store.get("bf-cookies");
  cookie.addEventListener("click", (e) => {
    const v = e.target.closest("[data-cookie-choice]")?.dataset.cookieChoice;
    if (!v) return;
    store.set("bf-cookies", v);
    cookie.hidden = true;
  });
})();
