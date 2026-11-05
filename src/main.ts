import "./style.css";
import { bookingUrl, validPhone, messages } from "./booking.mjs";

type Service = keyof typeof messages;
const phone = (import.meta.env.VITE_WHATSAPP_NUMBER || "").trim();
const hasWhatsApp = validPhone(phone);
const dialog = document.querySelector<HTMLDialogElement>(".booking-dialog")!;
const menuButton = document.querySelector<HTMLButtonElement>(".menu-toggle")!;
const menu = document.querySelector<HTMLElement>("#mobile-menu")!;
const form = document.querySelector<HTMLFormElement>("#booking-form")!;
const message = document.querySelector<HTMLElement>("#booking-message")!;
const continueLink =
  document.querySelector<HTMLAnchorElement>("#booking-continue")!;
const copyButton = document.querySelector<HTMLButtonElement>("#copy-message")!;
const status = document.querySelector<HTMLElement>("#copy-status")!;
const sticky = document.querySelector<HTMLElement>(".mobile-booking")!;
let currentService: Service = "geral";
let currentLocation = "unknown";
let trigger: HTMLElement | null = null;
let copyVersion = 0;

// An integration hook only. No analytics cookies or external requests are sent.
function track(action: string) {
  window.dispatchEvent(
    new CustomEvent("barbara:booking", {
      detail: {
        action,
        service: currentService,
        placement: currentLocation,
        channel: hasWhatsApp ? "whatsapp" : "instagram",
      },
    }),
  );
}
function closeMenu(restoreFocus = false) {
  menu.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menu.hidden = isOpen;
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
});
menu
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", () => closeMenu()));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) closeMenu(true);
});
document.addEventListener("click", (event) => {
  if (!(event.target as Element).closest(".site-header")) closeMenu();
});
matchMedia("(min-width: 701px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

function updateMessage() {
  copyVersion++;
  message.textContent = messages[currentService];
  continueLink.href = bookingUrl(currentService, phone);
  copyButton.innerHTML = 'Copiar mensagem <span aria-hidden="true">↗</span>';
  status.textContent = "";
}
if (hasWhatsApp) {
  document.querySelector("#booking-description")!.textContent =
    "Escolha o atendimento e continue a conversa pelo WhatsApp.";
  document.querySelector("[data-channel-note]")!.textContent =
    "Agendamentos pelo WhatsApp da Bárbara.";
  continueLink.innerHTML =
    'Continuar no WhatsApp <span aria-hidden="true">↗</span>';
  copyButton.hidden = true;
  document.querySelector("#booking-note")!.textContent =
    "A mensagem já vai preenchida. O horário é confirmado na conversa.";
}
document
  .querySelectorAll<HTMLAnchorElement>("[data-booking]")
  .forEach((link) => {
    const service = link.dataset.booking as Service;
    link.href = bookingUrl(service, phone);
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      trigger = link;
      currentService = service in messages ? service : "geral";
      currentLocation = link.dataset.location || "unknown";
      const radio = form.querySelector<HTMLInputElement>(
        `input[value="${currentService}"]`,
      )!;
      radio.checked = true;
      updateMessage();
      dialog.showModal();
      document.body.classList.add("is-locked");
      track("open");
    });
  });
form.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("change", () => {
  currentService = new FormData(form).get("service") as Service;
  updateMessage();
});
copyButton.addEventListener("click", async () => {
  const version = copyVersion;
  try {
    await navigator.clipboard.writeText(messages[currentService]);
    if (version !== copyVersion) return;
    copyButton.textContent = "Mensagem copiada ✓";
    status.textContent = "Mensagem copiada. Abra o Instagram e cole no direct.";
    track("copy_message");
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(message);
    selection?.removeAllRanges();
    selection?.addRange(range);
    status.textContent =
      "Selecione e copie a mensagem acima para enviar no direct.";
    copyButton.textContent = "Selecione a mensagem acima para copiar";
  }
});
continueLink.addEventListener("click", () => track("contact_click"));
document
  .querySelector(".dialog-close")!
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("is-locked");
  trigger?.focus();
});
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
if (!prefersReducedMotion.matches && "IntersectionObserver" in window) {
  document.body.classList.add("has-motion");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  document
    .querySelectorAll("[data-reveal]")
    .forEach((el) => observer.observe(el));
  prefersReducedMotion.addEventListener("change", (event) => {
    if (event.matches) document.body.classList.remove("has-motion");
  });
}
if ("IntersectionObserver" in window) {
  new IntersectionObserver(
    (entries) => {
      sticky.classList.toggle("is-hidden", entries[0].isIntersecting);
    },
    { threshold: 0.2 },
  ).observe(document.querySelector(".contact-copy")!);
}
document.querySelector("[data-year]")!.textContent = String(
  new Date().getFullYear(),
);
