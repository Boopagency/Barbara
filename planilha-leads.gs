/**
 * Recebe os leads do site e do link da bio e grava na planilha:
 * aba "Site" para quem veio do site, aba "Bio" para quem veio do link da bio.
 *
 * Como publicar:
 * 1. Crie a planilha no Google Sheets > Extensões > Apps Script > cole este arquivo > salvar.
 * 2. Implantar > Nova implantação > tipo "App da Web".
 *    Executar como: Eu · Quem pode acessar: Qualquer pessoa > Implantar > autorizar.
 * 3. Copie a URL que termina em /exec e cole em PLANILHA, no site/lead.js.
 * Se mudar este código depois: Implantar > Gerenciar implantações > editar > Nova versão.
 */
const COLUNAS = ["data", "intencao", "nome", "whatsapp", "servico", "urgencia", "bairro",
  "tipo", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

// Corta o tamanho e impede que um texto do formulário vire fórmula (=, +, -, @).
const limpa = (v) => String(v ?? "").slice(0, 200).replace(/^[=+\-@]/, "'$&");

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (!d.nome || !d.whatsapp) return ContentService.createTextOutput("faltou nome ou whatsapp");

  const nomeAba = d.pagina === "bio" ? "Bio" : "Site";
  const planilha = SpreadsheetApp.getActive();
  const aba = planilha.getSheetByName(nomeAba) || planilha.insertSheet(nomeAba);
  if (aba.getLastRow() === 0) aba.appendRow(COLUNAS);
  aba.appendRow([new Date(), ...COLUNAS.slice(1).map((c) => limpa(d[c]))]);
  return ContentService.createTextOutput("ok");
}
