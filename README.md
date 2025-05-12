# 💈 Agendify

Um bot de agendamento automatizado via WhatsApp com visualização da agenda em uma interface web. Ideal para barbearias, salões de beleza, clínicas ou qualquer negócio que trabalhe com horários marcados.

---

## 🚀 Funcionalidades

✅ Agendamento automático pelo WhatsApp  
✅ Consulta de agenda via comando `"mostrar agenda"`  
✅ Visualização da agenda em tempo real pelo navegador  
✅ Persistência em arquivo `.json`  
✅ Pronto para deploy com Twilio + Render  

---

## 📷 Exemplos

### ✅ WhatsApp:

### 🔗 Web:
Acesse: [`/agendamentos`](http://localhost:3000/agendamentos)

---

## 📦 Tecnologias utilizadas

- Node.js + Express
- Twilio WhatsApp API (Sandbox)
- HTML/CSS (interface simples)
- Render (deploy gratuito)
- Persistência com `agenda.json`

---

## 📁 Estrutura de pastas
├── agenda.json # Onde os agendamentos são salvos

├── public/

│ └── agendamentos.html

├── server.js # Código principal do servidor
├── .env # Credenciais da Twilio

## ⚙️ Variáveis de ambiente
Crie um arquivo `.env` com:
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

## 🛠️ Como executar localmente

```bash
npm install
npm start
```

Em seguida, acesse:
Web: http://localhost:3000/agendamentos
WhatsApp: Envie comandos para o sandbox da Twilio

🙌 Créditos

Desenvolvido por William Gigliozzi
Feito com carinho e coragem. 🚀
