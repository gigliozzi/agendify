require("dotenv").config();
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.messages
  .create({
    from: "whatsapp:+14155238886", // número padrão da Twilio no sandbox
    to: "whatsapp:+5521982822503", // seu número de telefone verificado
    contentSid: "HXb5b62575e6e4ff6129ad7c8efe1f983e", // template pré-criado no Twilio
    contentVariables: '{"1":"12/1","2":"3pm"}',
  })
  .then((message) => console.log("Mensagem enviada! SID:", message.sid))
  .catch((error) => console.error("Erro ao enviar mensagem:", error));
