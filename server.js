const fs = require("fs");
const path = require("path");

const express = require("express");
const app = express();

//Função para enviar o template com os botões (após upgrade do Twilio)
function sendMenuComBotoes(to) {
  const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  client.messages
    .create({
      from: "whatsapp:+13412013542",
      to: to,
      contentSid: "HX9075f84c6e5ebf42acb2b6c8738fdf33",
    })
    .then((msg) => console.log("🟢 Menu com botões enviado!", msg.sid))
    .catch((err) => console.error("Erro ao enviar menu com botões:", err));
}
// Fim de função para enviar o template com os botões

//Rota a página de agendamento
app.get("/agendamentos", (req, res) => {
  const htmlPath = path.join(__dirname, "public", "agendamentos.html");
  let html = fs.readFileSync(htmlPath, "utf8");

  function animaLi(element) {
    const liParent = element.parent("li");
    liParent.classList.add("anima-li");
  }

  const agendaHtml = schedule
    .map((slot) => {
      const id = Math.floor(Math.random() * 1000);
      const status = slot.available
        ? '<span class="livre">Livre</span>'
        : `<span class="reservado">${slot.reservedBy || "Reservado"}</span>`;
      return `<div id="${id}" ><span class="time">${slot.time}</span> <span class="status">${status}</span> <button class="bt-remover-agenda" onclick="removeItem(this)">X</button></div>`;
    })
    .join("");

  html = html.replace("<!-- AGENDA_DATA -->", agendaHtml);
  res.send(html);
});
// Fim de rota da página de agendamento

const agendaPath = path.join(__dirname, "agenda.json");

// Função para carregar a agenda
function carregarAgenda() {
  if (fs.existsSync(agendaPath)) {
    const data = fs.readFileSync(agendaPath, "utf8");
    return JSON.parse(data);
  } else {
    // agenda padrão se arquivo não existir
    return [
      { time: "14:00", available: true },
      { time: "15:00", available: true },
      { time: "16:00", available: true },
    ];
  }
}

// Função para salvar a agenda
function salvarAgenda() {
  if (!Array.isArray(schedule)) {
    console.error("⚠️ Schedule está inválido ao tentar salvar!");
    return;
  }

  fs.writeFileSync(agendaPath, JSON.stringify(schedule, null, 2), "utf8");
}

require("dotenv").config();
console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID); // Debug

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

const bodyParser = require("body-parser");
const axios = require("axios");

const port = 3000;

// Twilio API Configuração (envio simples)
const WHATSAPP_WEBHOOK =
  "https://api.twilio.com/2010-04-01/Accounts/" +
  TWILIO_ACCOUNT_SID +
  "/Messages.json";

// Simulação de horários disponíveis
let schedule = carregarAgenda();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota para listar horários disponíveis
app.get("/horarios", (req, res) => {
  const availableSlots = schedule.filter((slot) => slot.available);
  res.json(availableSlots);
});

// Rota para reservar um horário
app.post("/webhook", (req, res) => {
  const message = req.body.Body ? req.body.Body.toLowerCase() : "";
  const from = req.body.From;
  const payload = req.body.ButtonPayload;

  console.log("Mensagem recebida:", message);
  console.log(">> Payload do botão:", payload);
  console.log(">> Valor de 'from':", from);
  console.log(">> Valor de TWILIO_WHATSAPP_NUMBER:", TWILIO_WHATSAPP_NUMBER);

  // 1. Menu inicial
  if (
    message.includes("oi") ||
    message.includes("olá") ||
    message.includes("menu") ||
    message.includes("início")
  ) {
    sendMenuComBotoes(from);
    return res.sendStatus(204).end();
  }

  // 2. Mostrar agenda formatada
  if (message.includes("mostrar agenda")) {
    const agenda = schedule
      .map((slot) => {
        const status = slot.available
          ? "Livre"
          : slot.reservedBy || "Reservado";
        return `• ${slot.time} – ${status}`;
      })
      .join("\n");

    sendTextWhatsAppMessage(from, `💈 Agenda de hoje:\n${agenda}`);
    return res.sendStatus(204).end();
  }

  // 3. Botão "Ver horários disponíveis"
  if (payload === "horarios") {
    const availableTimes = schedule
      .filter((slot) => slot.available)
      .map((slot) => slot.time)
      .join(", ");

    if (availableTimes.length > 0) {
      sendTextWhatsAppMessage(
        from,
        `Os horários disponíveis são: ${availableTimes}`
      );
    } else {
      sendTextWhatsAppMessage(
        from,
        "Desculpe, não há horários disponíveis no momento."
      );
    }

    return res.sendStatus(204).end();
  }

  // 4. Botão "Reservar um horário" via List Picker
  if (payload && payload.startsWith("reserva_")) {
    const selectedHour = payload.replace("reserva_", "") + ":00";

    const slot = schedule.find((slot) => slot.time === selectedHour);
    if (slot && slot.available) {
      slot.available = false;
      slot.reservedBy = "byCiente";

      salvarAgenda();

      sendTextWhatsAppMessage(
        from,
        `✅ Horário ${selectedHour} reservado com sucesso!`
      );

      // Notifica o proprietário
      const PROPRIETARIO = TWILIO_WHATSAPP_NUMBER;
      sendTextWhatsAppMessage(
        PROPRIETARIO,
        `📅 O cliente reservou o horário ${selectedHour}.`
      );
    } else {
      sendTextWhatsAppMessage(
        from,
        `❌ Desculpe, o horário ${selectedHour} não está mais disponível.`
      );
    }

    return res.sendStatus(204).end();
  }

  // 5. Botão "Falar com atendente"
  if (payload === "atendente") {
    sendTextWhatsAppMessage(
      from,
      "🧑‍💼 Você será redirecionado para um atendente. Por favor, aguarde enquanto alguém entra em contato com você."
    );

    const PROPRIETARIO = TWILIO_WHATSAPP_NUMBER;
    sendTextWhatsAppMessage(
      PROPRIETARIO,
      `📞 O cliente solicitou falar com um atendente.`
    );

    return res.sendStatus(204).end();
  }

  // 6. Entrada digitada: "Reservar 14:00"
  // Este trecho poderá ser removido no futuro,
  // pois a interação com o menu já está sendo feita via payload
  if (message.includes("reservar")) {
    const selectedTime = message.match(/\d{2}:\d{2}/);
    if (
      selectedTime &&
      schedule.find((slot) => slot.time === selectedTime[0] && slot.available)
    ) {
      const slot = schedule.find((slot) => slot.time === selectedTime[0]);
      slot.available = false;
      slot.reservedBy = "byCiente";

      salvarAgenda();

      sendTextWhatsAppMessage(
        from,
        `Horário ${selectedTime[0]} reservado com sucesso!`
      );
    } else {
      sendTextWhatsAppMessage(
        from,
        "Desculpe, esse horário não está disponível."
      );
    }

    return res.sendStatus(204).end();
  }

  // 7. Fallback para mensagens fora do fluxo
  sendTextWhatsAppMessage(
    from,
    'Olá! Para verificar horários disponíveis, envie "Horários disponíveis". Para reservar, envie "Reservar HH:MM".'
  );

  return res.sendStatus(204).end();
});


// ENVIA MENSAGEM VIA TEMPLATE APROVADO
function sendTemplateWhatsAppMessage(to, name, time) {
  const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  client.messages
    .create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: to,
      contentSid: "HX9a901c3f12a1457bb7dec4808b858f48", // <-- Substitua pelo seu contentSid real
      contentVariables: JSON.stringify({
        1: name,
        2: time,
      }),
    })
    .then((message) =>
      console.log("Mensagem enviada com template! SID:", message.sid)
    )
    .catch((err) =>
      console.error("Erro ao enviar mensagem com template:", err)
    );
}

// ENVIA MENSAGEM SIMPLES (texto direto)
function sendTextWhatsAppMessage(to, message) {
  console.log(">> Enviando para:", to);
  console.log(">> De:", TWILIO_WHATSAPP_NUMBER);
  axios
    .post(
      WHATSAPP_WEBHOOK,
      new URLSearchParams({
        To: to,
        From: TWILIO_WHATSAPP_NUMBER,
        Body: message,
      }),
      {
        auth: {
          username: TWILIO_ACCOUNT_SID,
          password: TWILIO_AUTH_TOKEN,
        },
      }
    )
    .then(() => console.log("Mensagem simples enviada para", to))
    .catch((err) => console.error("Erro ao enviar mensagem simples:", err));
}

// Inicializa servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
