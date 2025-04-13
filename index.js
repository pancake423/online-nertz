import { GameServer } from "./gameserver.js";
import express from "express";
import { WebSocketServer } from "ws";

import { publicIpv4 } from "public-ip";
import os from "node:os";

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

const server = app.listen(PORT, async () => {
  console.log(`machine address: localhost:${PORT}`);
  console.log(`local address: http://${getIPAddress()}:${PORT}`);
  console.log(`public address: http://${await publicIpv4()}`);
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});

// https://stackoverflow.com/a/15075395
function getIPAddress() {
  var interfaces = os.networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      )
        return alias.address;
    }
  }
  return "0.0.0.0";
}

function send(ws, data) {
  ws.send(JSON.stringify(data));
}

function handleMessage(wss, ws, m) {
  const message = JSON.parse(m);
  let res;
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
      res = GameServer.assignClient(message.uuid, message.id);
      if (res.ok) {
        send(ws, {
          type: "joined",
          gameID: res.gameID,
          lobbyID: message.id,
          host: res.host,
        });
        GameServer.updatePlayerList(message.id);
      } else {
        send(ws, { type: "joinfailed" });
      }
      console.log(GameServer.lobbies);
      break;
    case "matchstart":
      // only allowed for host
      res = GameServer.startGame(message.lobbyID, message.uuid);
      if (!res.ok) {
        send(ws, { type: "startfailed", reason: res.reason });
      }
      break;
    case "addbot":
      console.log("addbot not implemented");
      break;
    default:
      console.log(`invalid message: ${message}`);
      break;
  }
}
