/* ==========================================================
   Barbara Fonseca · Médica Veterinária
   Contatos do site. O formulário de lead fica em lead.js.
   ========================================================== */

const CONFIG = {
  // TODO: trocar pelos dados reais antes de publicar
  whatsapp: "5541987269000",            // só números, com DDI + DDD (mesmo número em lead.js)
  phoneDisplay: "(41) 9 8726-9000",
  email: "contato@barbarafonseca.vet.br",
  instagram: "https://instagram.com/",
  address: "Rua Exemplo, 123 · Curitiba/PR",
  addressShort: "Curitiba · PR",
  hoursShort: "Seg a sáb, com hora marcada",
  hoursLong: "Seg a sex · 8h às 18h  ·  Sáb · 8h às 12h",
  crmv: "CRMV-PR 00000",
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- dados de contato no HTML ---------- */
function bindConfig() {
  $$("[data-cfg]").forEach((el) => { const v = CONFIG[el.dataset.cfg]; if (v) el.textContent = v; });
  $$("[data-cfg-href]").forEach((el) => {
    const k = el.dataset.cfgHref;
    if (k === "tel") el.href = `tel:+${CONFIG.whatsapp}`;
    else if (k === "email") el.href = `mailto:${CONFIG.email}`;
    else if (CONFIG[k]) el.href = CONFIG[k];
  });
  const y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
}

/* ---------- menu mobile ---------- */
const burger = $("[data-burger]");
const menu = $("#menu");
function closeMenu() { menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
burger.addEventListener("click", () => {
  const open = !menu.classList.contains("is-open");
  menu.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
});
menu.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

/* ---------- header, dock e animações de entrada ---------- */
const header = $("[data-header]");
const dock = $("[data-dock]");
const hero = $(".hero");
new IntersectionObserver(([en]) => {
  header.classList.toggle("is-scrolled", !en.isIntersecting || en.boundingClientRect.top < 0);
  dock.classList.toggle("is-on", !en.isIntersecting);
}, { rootMargin: "-80px 0px 0px 0px" }).observe(hero);

const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("is-in");
    io.unobserve(en.target);
  });
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
$$(".reveal").forEach((el) => io.observe(el));

/* ---------- init ---------- */
bindConfig();
