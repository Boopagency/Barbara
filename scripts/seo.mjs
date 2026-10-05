import { readFile, writeFile } from "node:fs/promises";
import { loadEnv } from "vite";
import { bookingUrl, validPhone } from "../src/booking.mjs";

const env = { ...loadEnv("production", process.cwd(), ""), ...process.env };
const input = (env.VITE_SITE_URL || "").trim();
const phone = (env.VITE_WHATSAPP_NUMBER || "").trim();
if (phone && !validPhone(phone))
  throw new Error(
    "VITE_WHATSAPP_NUMBER must be a verified Brazilian number: 55 + DDD + number, digits only.",
  );
let html = await readFile("dist/index.html", "utf8");
// Keep contact links functional even without JavaScript.
html = html.replace(/<a\b[^>]*data-booking="([^"]+)"[^>]*>/g, (tag, service) =>
  tag.replace(
    /href="[^"]*"/,
    `href="${bookingUrl(service, phone).replaceAll("&", "&amp;")}"`,
  ),
);
if (phone)
  html = html.replace(
    "Agendamentos pelo Instagram da Bárbara.",
    "Agendamentos pelo WhatsApp da Bárbara.",
  );
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "#barbara",
      name: "Bárbara Fonseca",
      jobTitle: "Médica veterinária",
      sameAs: ["https://www.instagram.com/barbarafonsecavet/"],
      workLocation: { "@type": "City", name: "Curitiba" },
    },
    ...[
      "Consulta veterinária",
      "Vacinação de cães e gatos",
      "Atendimento veterinário domiciliar",
    ].map((name) => ({
      "@type": "Service",
      name,
      provider: { "@id": "#barbara" },
      areaServed: {
        "@type": "City",
        name: "Curitiba",
        containedInPlace: { "@type": "State", name: "Paraná" },
      },
    })),
  ],
};
let extra = `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>`;
if (input) {
  const url = new URL(input);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    /^(localhost|127\.|\[::1\])/.test(url.hostname)
  )
    throw new Error(
      "VITE_SITE_URL must be a public HTTPS origin without a path, credentials, query or fragment.",
    );
  const origin = url.origin;
  html = html.replace(
    'content="noindex, nofollow"',
    'content="index, follow, max-image-preview:large"',
  );
  extra += `<link rel="canonical" href="${origin}/" /><meta property="og:url" content="${origin}/" /><meta property="og:image" content="${origin}/images/social.jpg" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />`;
  await writeFile(
    "dist/robots.txt",
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
  );
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>`,
  );
  console.log("Production SEO enabled for", origin);
} else {
  await writeFile("dist/robots.txt", "User-agent: *\nDisallow: /\n");
  console.log(
    "Preview mode: noindex. Set VITE_SITE_URL for production canonical and sitemap.",
  );
}
await writeFile("dist/index.html", html.replace("</head>", `${extra}</head>`));
