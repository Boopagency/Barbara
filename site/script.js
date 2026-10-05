/* ==========================================================
   Bárbara Fonseca · Médica Veterinária
   Tudo o que muda com frequência fica no CONFIG abaixo.
   ========================================================== */

const CONFIG = {
  // TODO: trocar pelos dados reais antes de publicar
  whatsapp: "554187269000",             // só números, com DDI + DDD
  phoneDisplay: "(41) 8726-9000",
  email: "contato@barbarafonseca.vet.br",
  instagram: "https://instagram.com/",
  address: "Rua Exemplo, 123 · Curitiba/PR",
  addressShort: "Curitiba · PR",
  hoursShort: "Seg–Sáb, com hora marcada",
  hoursLong: "Seg a sex · 8h às 18h  ·  Sáb · 8h às 12h",
  crmv: "CRMV-PR 00000",

  // Grade de horários por dia da semana (0 = domingo)
  schedule: {
    0: [],
    1: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
    2: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
    3: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
    4: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
    5: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
    6: ["08:00", "09:00", "10:00", "11:00"],
  },
  daysAhead: 21,        // até quantos dias à frente dá para agendar
  minLeadHours: 2,      // antecedência mínima
  // Dias inteiros ("2026-12-25") ou horários ("2026-10-08 14:00") indisponíveis
  blocked: ["2026-10-12", "2026-11-02", "2026-11-15", "2026-11-20", "2026-12-25"],
};

const SERVICES = [
  { id: "consulta",   name: "Consulta clínica",          dur: "50 min", note: "Avaliação completa" },
  { id: "vacina",     name: "Vacinas e vermifugação",    dur: "20 min", note: "Traga a carteirinha" },
  { id: "checkup",    name: "Check-up preventivo",       dur: "40 min", note: "Exames orientados" },
  { id: "domiciliar", name: "Atendimento domiciliar",    dur: "60 min", note: "Na sua casa", home: true },
  { id: "filhote",    name: "Primeira consulta",         dur: "60 min", note: "Filhotes de cão ou gato" },
  { id: "senior",     name: "Check-up do pet idoso",     dur: "60 min", note: "A partir de 7 anos" },
  { id: "retorno",    name: "Retorno",                   dur: "30 min", note: "Até 30 dias da consulta" },
  { id: "outro",      name: "Não sei qual escolher",     dur: "—",      note: "A Bárbara te orienta" },
];

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const fmt = (opts) => new Intl.DateTimeFormat("pt-BR", opts);
const fWeekShort = fmt({ weekday: "short" });
const fMonthShort = fmt({ month: "short" });
const fLong = fmt({ weekday: "long", day: "numeric", month: "long" });
const clean = (s) => s.replace(".", "");
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } },
};
const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/* ---------- agenda ---------- */
function slotsFor(dateIso) {
  const d = fromIso(dateIso);
  if (CONFIG.blocked.includes(dateIso)) return [];
  const limit = Date.now() + CONFIG.minLeadHours * 36e5;
  return (CONFIG.schedule[d.getDay()] || []).filter((t) => {
    if (CONFIG.blocked.includes(`${dateIso} ${t}`)) return false;
    const [h, m] = t.split(":").map(Number);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m).getTime() > limit;
  });
}
function nextDays() {
  const out = [];
  const t = new Date();
  for (let i = 0; i < CONFIG.daysAhead; i++) {
    out.push(iso(new Date(t.getFullYear(), t.getMonth(), t.getDate() + i)));
  }
  return out;
}
function relDay(dateIso) {
  const today = iso(new Date());
  const t = new Date(); const tomorrow = iso(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1));
  if (dateIso === today) return "Hoje";
  if (dateIso === tomorrow) return "Amanhã";
  const d = fromIso(dateIso);
  return `${clean(fWeekShort.format(d))}, ${d.getDate()}/${pad(d.getMonth() + 1)}`;
}
function upcoming(max, perDay = 2) {
  const res = [];
  for (const day of nextDays()) {
    for (const t of slotsFor(day).slice(0, perDay)) {
      res.push({ date: day, time: t });
      if (res.length >= max) return res;
    }
  }
  return res;
}

/* ---------- dados de contato no HTML ---------- */
function bindConfig() {
  $$("[data-cfg]").forEach((el) => { const v = CONFIG[el.dataset.cfg]; if (v) el.textContent = v; });
  $$("[data-cfg-href]").forEach((el) => {
    const k = el.dataset.cfgHref;
    if (k === "whatsapp") el.href = waLink("Olá, Bárbara! Vim pelo site e queria tirar uma dúvida.");
    else if (k === "email") el.href = `mailto:${CONFIG.email}`;
    else if (CONFIG[k]) el.href = CONFIG[k];
  });
  const y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
}

/* ---------- próximos horários (hero + CTA final) ---------- */
function renderSlots() {
  const [first] = upcoming(1);
  const label = $("[data-next-slot-label]");
  const chip = $("[data-next-slot]");
  if (first) {
    label.textContent = `${relDay(first.date)} · ${first.time}`;
    chip.addEventListener("click", () => Booking.open({ date: first.date, time: first.time }));
  } else {
    label.textContent = "Ver agenda";
    chip.addEventListener("click", () => Booking.open());
  }

  const grid = $("[data-quick-slots]");
  grid.innerHTML = "";
  upcoming(6).forEach(({ date, time }) => {
    const b = document.createElement("button");
    b.className = "quick";
    b.type = "button";
    b.innerHTML = `<small>${relDay(date)}</small><strong>${time}</strong>`;
    b.setAttribute("aria-label", `Agendar ${fLong.format(fromIso(date))} às ${time}`);
    b.addEventListener("click", () => Booking.open({ date, time }));
    grid.append(b);
  });
}

/* ==========================================================
   AGENDAMENTO
   ========================================================== */
const Booking = (() => {
  const dlg = $("[data-book-dialog]");
  const form = $("[data-book-form]");
  const steps = $$("[data-step]", form);
  const title = $("[data-step-title]");
  const bars = $$(".book__progress li");
  const btnNext = $("[data-next]");
  const btnBack = $("[data-back]");
  const TITLES = ["Qual atendimento?", "Escolha dia e horário", "Sobre vocês", "Confere se está tudo certo"];
  const NEXT_LABEL = `Continuar <svg aria-hidden="true"><use href="#i-arrow"/></svg>`;

  const state = { step: 1, service: null, local: "Consultório", date: null, time: null };

  /* passo 1 — serviços */
  const opts = $("[data-services]");
  opts.innerHTML = SERVICES.map((s) => `
    <label class="opt">
      <input type="radio" name="servico" value="${s.id}">
      <span><strong>${s.name}</strong><small>${s.dur === "—" ? s.note : `${s.dur} · ${s.note}`}</small></span>
    </label>`).join("");
  opts.addEventListener("change", (e) => {
    state.service = e.target.value;
    const svc = SERVICES.find((s) => s.id === state.service);
    if (svc?.home) setLocal("Domiciliar");
    sync();
  });
  form.addEventListener("change", (e) => { if (e.target.name === "local") state.local = e.target.value; });
  function setLocal(v) {
    state.local = v;
    const r = $(`input[name="local"][value="${v}"]`, form); if (r) r.checked = true;
  }

  /* passo 2 — dias e horários */
  const daysEl = $("[data-days]");
  const timesEl = $("[data-times]");
  const dayLabel = $("[data-day-label]");
  function renderDays() {
    daysEl.innerHTML = nextDays().map((d) => {
      const dt = fromIso(d);
      const off = slotsFor(d).length === 0;
      return `<label class="day"><input type="radio" name="dia" value="${d}" ${off ? "disabled" : ""} ${d === state.date ? "checked" : ""}>
        <span><small>${clean(fWeekShort.format(dt))}</small><strong>${dt.getDate()}</strong><em>${clean(fMonthShort.format(dt))}</em></span></label>`;
    }).join("");
  }
  function renderTimes() {
    if (!state.date) {
      timesEl.innerHTML = `<p class="times__empty">Escolha um dia para ver os horários.</p>`;
      dayLabel.textContent = "";
      return;
    }
    dayLabel.textContent = `· ${fLong.format(fromIso(state.date))}`;
    const list = slotsFor(state.date);
    const groups = [["Manhã", list.filter((t) => +t.slice(0, 2) < 12)], ["Tarde", list.filter((t) => +t.slice(0, 2) >= 12)]];
    timesEl.innerHTML = groups.filter(([, l]) => l.length).map(([g, l]) => `
      <p class="times__group">${g}</p>
      ${l.map((t) => `<label class="time"><input type="radio" name="hora" value="${t}" ${t === state.time ? "checked" : ""}><span>${t}</span></label>`).join("")}
    `).join("") || `<p class="times__empty">Sem horários neste dia. Que tal o próximo?</p>`;
  }
  daysEl.addEventListener("change", (e) => {
    state.date = e.target.value; state.time = null;
    renderTimes(); sync();
  });
  timesEl.addEventListener("change", (e) => { state.time = e.target.value; sync(); });

  /* passo 3 — dados */
  const phone = $("[data-phone]", form);
  phone.addEventListener("input", () => {
    const d = phone.value.replace(/\D/g, "").slice(0, 11);
    let v = d;
    if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) v = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    phone.value = v;
  });
  form.addEventListener("input", (e) => e.target.classList?.remove("is-invalid"));

  function fields() {
    const f = new FormData(form);
    return {
      pet: (f.get("pet") || "").trim(),
      especie: f.get("especie") || "Cão",
      tutor: (f.get("tutor") || "").trim(),
      fone: (f.get("fone") || "").trim(),
      obs: (f.get("obs") || "").trim(),
    };
  }
  function validateStep3() {
    const bad = [];
    const f = fields();
    if (!f.pet) bad.push(form.pet);
    if (!f.tutor) bad.push(form.tutor);
    if (f.fone.replace(/\D/g, "").length < 10) bad.push(form.fone);
    bad.forEach((el) => el.classList.add("is-invalid"));
    if (bad.length) bad[0].focus();
    return !bad.length;
  }

  /* passo 4 — resumo */
  const summary = $("[data-summary]");
  function whenText() { return `${fLong.format(fromIso(state.date))} às ${state.time}`; }
  function renderSummary() {
    const f = fields();
    const svc = SERVICES.find((s) => s.id === state.service);
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    summary.innerHTML = `
      <h3>${esc(f.pet)} · ${svc.name}</h3>
      <div class="summary__when"><svg aria-hidden="true"><use href="#i-cal"/></svg>
        <div><strong>${whenText()}</strong><small>${state.local === "Domiciliar" ? "Atendimento na sua casa" : "No consultório"}${svc.dur !== "—" ? ` · ${svc.dur}` : ""}</small></div></div>
      <dl>
        <dt>Pet</dt><dd>${esc(f.pet)} (${esc(f.especie)})</dd>
        <dt>Tutor(a)</dt><dd>${esc(f.tutor)}</dd>
        <dt>WhatsApp</dt><dd>${esc(f.fone)}</dd>
        ${f.obs ? `<dt>Obs.</dt><dd>${esc(f.obs)}</dd>` : ""}
      </dl>`;
  }
  function message() {
    const f = fields();
    const svc = SERVICES.find((s) => s.id === state.service);
    return [
      "Olá, Bárbara! Gostaria de agendar um atendimento 🐾",
      "",
      `• Atendimento: ${svc.name}${svc.dur !== "—" ? ` (${svc.dur})` : ""}`,
      `• Onde: ${state.local === "Domiciliar" ? "Na minha casa" : "No consultório"}`,
      `• Quando: ${whenText()}`,
      `• Pet: ${f.pet} (${f.especie})`,
      `• Tutor(a): ${f.tutor}`,
      `• WhatsApp: ${f.fone}`,
      f.obs ? `• Observações: ${f.obs}` : "",
    ].filter(Boolean).join("\n");
  }

  /* navegação */
  function canAdvance() {
    if (state.step === 1) return !!state.service;
    if (state.step === 2) return !!(state.date && state.time);
    return true;
  }
  function sync() {
    btnNext.disabled = !canAdvance();
  }
  function go(n) {
    state.step = n;
    steps.forEach((s) => { s.hidden = +s.dataset.step !== n; });
    title.textContent = TITLES[n - 1];
    bars.forEach((b, i) => b.classList.toggle("on", i < n));
    btnBack.style.visibility = n === 1 ? "hidden" : "visible";
    btnNext.innerHTML = n === 4 ? `Confirmar pelo WhatsApp <svg aria-hidden="true"><use href="#i-chat"/></svg>` : NEXT_LABEL;
    if (n === 2) {
      renderDays(); renderTimes();
      requestAnimationFrame(() => $(".day input:checked", daysEl)?.parentElement.scrollIntoView({ inline: "center", block: "nearest" }));
    }
    if (n === 4) renderSummary();
    $(".book__body", dlg).scrollTop = 0;
    sync();
  }

  btnBack.addEventListener("click", () => go(Math.max(1, state.step - 1)));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!canAdvance()) return;
    if (state.step === 3 && !validateStep3()) return;
    if (state.step < 4) return go(state.step + 1);

    const f = fields();
    store.set("bf-tutor", { tutor: f.tutor, fone: f.fone, pet: f.pet, especie: f.especie });
    window.open(waLink(message()), "_blank", "noopener");
    showDone(f);
  });

  function showDone(f) {
    steps.forEach((s) => { s.hidden = true; });
    bars.forEach((b) => b.classList.add("on"));
    title.textContent = "Pedido enviado!";
    let done = $(".done", dlg);
    if (!done) { done = document.createElement("div"); done.className = "done"; $(".book__body", dlg).append(done); }
    done.hidden = false;
    done.innerHTML = `<div class="done__ico"><svg><use href="#i-check"/></svg></div>
      <h3>Agora é só enviar no WhatsApp</h3>
      <p>Abrimos a conversa com tudo preenchido. A Bárbara confirma o horário de ${f.pet.replace(/</g, "")} por lá.</p>
      <p><a href="${waLink(message())}" target="_blank" rel="noopener">O WhatsApp não abriu? Toque aqui.</a></p>`;
    btnBack.style.visibility = "hidden";
    btnNext.innerHTML = "Fechar";
    btnNext.disabled = false;
    state.step = 5;
  }

  /* abrir / fechar */
  function open(pre = {}) {
    // limpa estado anterior, mantém os dados do tutor
    form.reset();
    $(".done", dlg)?.setAttribute("hidden", "");
    Object.assign(state, { service: null, local: "Consultório", date: null, time: null });
    const saved = store.get("bf-tutor");
    if (saved) {
      form.tutor.value = saved.tutor || "";
      form.fone.value = saved.fone || "";
    }
    if (pre.service) {
      state.service = pre.service;
      const r = $(`input[name="servico"][value="${pre.service}"]`, form); if (r) r.checked = true;
      if (SERVICES.find((s) => s.id === pre.service)?.home) setLocal("Domiciliar");
    }
    if (pre.date) { state.date = pre.date; state.time = pre.time || null; }

    let step = 1;
    if (state.service) step = state.date && state.time ? 3 : 2;
    go(step);
    dlg.showModal();
    history.replaceState(null, "", "#agendar");
  }
  function close() { dlg.close(); }

  btnNext.addEventListener("click", (e) => { if (state.step === 5) { e.preventDefault(); close(); } });
  $("[data-book-close]").addEventListener("click", close);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  dlg.addEventListener("close", () => {
    if (location.hash === "#agendar") history.replaceState(null, "", location.pathname + location.search);
  });

  return { open };
})();

/* ---------- gatilhos de agendamento ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-book]");
  if (!t) return;
  e.preventDefault();
  closeMenu();
  Booking.open({ service: t.dataset.book || null });
});

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

/* ---------- depoimentos ---------- */
const track = $("[data-reviews-track]");
const arrows = $$("[data-reviews]");
function updateArrows() {
  const max = track.scrollWidth - track.clientWidth - 2;
  arrows[0].disabled = track.scrollLeft <= 2;
  arrows[1].disabled = track.scrollLeft >= max;
}
arrows.forEach((b) => b.addEventListener("click", () => {
  const card = track.firstElementChild;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  track.scrollBy({ left: (+b.dataset.reviews) * (card.offsetWidth + gap), behavior: "smooth" });
}));
track.addEventListener("scroll", updateArrows, { passive: true });
window.addEventListener("resize", updateArrows);

/* ---------- init ---------- */
bindConfig();
renderSlots();
updateArrows();
if (location.hash === "#agendar") Booking.open();
