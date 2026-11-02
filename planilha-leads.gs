/**
 * Recebe os leads de /links e grava na aba "Leads" da planilha.
 *
 * Como publicar:
 * 1. Crie a planilha no Google Sheets > Extensões > Apps Script > cole este arquivo > salvar.
 * 2. Implantar > Nova implantação > tipo "App da Web".
 *    Executar como: Eu · Quem pode acessar: Qualquer pessoa > Implantar > autorizar.
 * 3. Copie a URL que termina em /exec e cole em PLANILHA, no links.html.
 */
const COLUNAS = ["data", "intencao", "nome", "whatsapp", "servico", "urgencia", "bairro",
  "tipo", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

// Corta o tamanho e impede que um texto do formulário vire fórmula (=, +, -, @).
const limpa = (v) => String(v ?? "").slice(0, 200).replace(/^[=+\-@]/, "'$&");

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (!d.nome || !d.whatsapp) return ContentService.createTextOutput("faltou nome ou whatsapp");

  const planilha = SpreadsheetApp.getActive();
  const aba = planilha.getSheetByName("Leads") || planilha.insertSheet("Leads");
  if (aba.getLastRow() === 0) aba.appendRow(COLUNAS);
  aba.appendRow([new Date(), ...COLUNAS.slice(1).map((c) => limpa(d[c]))]);
  return ContentService.createTextOutput("ok");
}
