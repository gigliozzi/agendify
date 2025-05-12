const accountSid = "ACaf4e98509bf122c50e6502a34b2cd6fd";
const authToken = "e5c64758cd8261236fc394b2bdc86578";
const client = require("twilio")(accountSid, authToken);

client.messages
  .create({
    from: "whatsapp:+14155238886", // número padrão da Twilio no sandbox
    to: "whatsapp:+5521982822503", // seu número de telefone verificado
    contentSid: "HXb5b62575e6e4ff6129ad7c8efe1f983e", // template pré-criado no Twilio
    contentVariables: '{"1":"12/1","2":"3pm"}',
  })
  .then((message) => console.log("Mensagem enviada! SID:", message.sid))
  .catch((error) => console.error("Erro ao enviar mensagem:", error));
