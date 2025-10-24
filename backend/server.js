import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

import loginRouter from "./routes/login.js";
import signRouter from "./routes/sign.js";
import profileRouter from "./routes/profile.js";
import adRouter from "./routes/advertisement.js";
import messagesRouter from "./routes/messages.js";

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(cors());

app.use("/login", loginRouter);
app.use("/sign", signRouter);
app.use("/profile", profileRouter);
app.use("/ad", adRouter);
app.use("/messages", messagesRouter);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map(); 

wss.on("connection", (ws) => {
  console.log("Cliente WS conectado");

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === "SET_USER") {
        clients.set(msg.userId, ws);
        ws.userId = msg.userId;
        console.log(`Usuário ${msg.userId} conectado via WebSocket`);
      }
    } catch (err) {
      console.error("Erro ao processar mensagem WS:", err);
    }
  });

  ws.on("close", () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log(`Usuário ${ws.userId} desconectado`);
    }
  });
});

function sendToUser(userId, data) {
  const client = clients.get(userId);
  if (client && client.readyState === 1) {
    client.send(JSON.stringify(data));
  }
}

app.set("sendToUser", sendToUser);

server.listen(PORT, () => {
  console.log(`Servidor HTTP + WS rodando em http://localhost:${PORT}`);
});
