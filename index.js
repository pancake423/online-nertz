import { GameServer } from "./gameserver.js";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use("/shared", express.static("shared"));
app.use(express.json());

const wss = new WebSocketServer({ noServer: true });
wss.on("connection", (ws) => {
  ws.on("message", (message) => handleMessage(wss, ws, message));
  ws.on("close", () => {
    GameServer.disconnect(ws);
  });
});

const server = app.listen(PORT, () => {
  console.log(`local server URL: localhost:${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});

function send(ws, data) {
  ws.send(JSON.stringify(data));
}

function handleMessage(wss, ws, m) {
  const message = JSON.parse(m);
  console.log(message);
  switch (message.type) {
    case "newuser":
      GameServer.newClient(message.uuid, ws);
      // console.log(GameServer.clients);
      break;
    case "userinfo":
      GameServer.setClientInfo(message.uuid, message);
      break;
    case "getid":
      // implies that we also want to create a server w/ that id.
      const lobbyID = GameServer.getLobbyID();
      GameServer.createLobby(lobbyID);
      send(ws, { type: "lobbyid", id: lobbyID });
      break;
    case "makeserver":
      break;
    case "joinserver":
      const res = GameServer.assignClient(message.uuid, message.id);
      if (res.ok) {
        send(ws, { type: "joined", gameID: res.gameID, lobbyID: message.id });
      } else {
        send(ws, { type: "joinfailed" });
      }
      break;
    default:
      console.log(`invalid message: ${message}`);
      break;
  }
}
