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
  ws.on("message", (message) => console.log(message));
});

function checkOk(res, ok, msg) {
  if (!ok) res.json({ accepted: false, reason: msg });
  return ok;
}

app.get("/id", (req, res) => {
  res.json({ id: GameServer.getLobbyID() });
});

app.post("/create", (req, res) => {
  const id = req.body.id;
  const pid = req.body.uuid;
  const username = req.body.username;

  if (!checkOk(res, GameServer.createLobby(id), "Duplicate lobby ID"))
    return false;
  if (
    !checkOk(
      res,
      GameServer.assignClient(pid, id, username),
      "Failed to join lobby.",
    )
  )
    return false;
  res.json({ accepted: true });
});

app.post("/join", (req, res) => {
  const id = req.body.id;
  const pid = req.body.uuid;
  const username = req.body.username;

  if (
    !checkOk(
      res,
      GameServer.assignClient(pid, id, username),
      "Failed to join lobby.",
    )
  )
    return false;
  res.json({ accepted: true });
});

const server = app.listen(PORT, () => {
  console.log(`local server URL: localhost:${PORT}`);
});
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});
