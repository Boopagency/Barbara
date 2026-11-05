export const INSTAGRAM_URL = "https://www.instagram.com/barbarafonsecavet/";
export const messages = {
  consulta:
    "Olá, Bárbara! Gostaria de agendar uma consulta veterinária para o meu pet. Podemos conversar sobre os horários?",
  vacinacao:
    "Olá, Bárbara! Gostaria de agendar a vacinação do meu pet. Podemos conversar sobre as vacinas e os horários?",
  domiciliar:
    "Olá, Bárbara! Gostaria de consultar a disponibilidade de atendimento domiciliar em Curitiba. Posso informar meu bairro e o que meu pet precisa?",
  geral:
    "Olá, Bárbara! Gostaria de saber mais sobre os atendimentos e combinar um horário para o meu pet.",
};
export function validPhone(phone = "") {
  return /^55\d{10,11}$/.test(phone);
}
export function bookingUrl(service, phone = "") {
  const message = messages[service] || messages.geral;
  return validPhone(phone)
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : INSTAGRAM_URL;
}
