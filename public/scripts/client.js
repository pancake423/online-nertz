/*
rewrite:
all information goes through the websocket
call an event whenever a message is recieved
have a type field that determines how the message is handled
*/

import { State } from "/scripts/state.js";
import { UI } from "/scripts/ui.js";
import { EventHandler } from "/scripts/events.js";

const UUID_LENGTH = 16;

EventHandler.addEventListener("message", onMessage);
EventHandler.addEventListener("join-start", startJoin);
EventHandler.addEventListener("create-start", startCreate);
EventHandler.addEventListener("match-start", startMatch);
EventHandler.addEventListener("add-bot", addBot);

// "public" methods are created as object members
// "private" ones are just non-exported class methods.
const Client = Object.seal({
  UUID: generateRandomUUID(),
  lobbyID: undefined,
  webSocket: undefined,

  getAvailableServerID: () => {
    Client.sendData({ type: "getid" });
  },
  joinServer: (id) => {
    Client.sendData({ type: "joinserver", id: id });
  },
  connect: () => {
    Client.webSocket = new WebSocket("/");
    Client.webSocket.onopen = () => {
      Client.sendData({ type: "newuser" });
    };
    Client.webSocket.onmessage = (e) =>
      EventHandler.raiseEvent("message", JSON.parse(e.data));
  },

  sendData: (data) => {
    // ensure that uuid is sent with data
    // and has a type so server can identify it
    const d = Object.assign({}, data);
    if (d.type == undefined)
      throw new Error(`object ${d} does not define a type`);
    d.uuid = Client.UUID;
    Client.webSocket.send(JSON.stringify(d)); // oopsies
  },

  sendUserInfo: () => {
    Client.sendData({
      type: "userinfo",
      username: UI.username,
      cardColor: UI.deckColor,
      cardDesign: UI.design,
    });
  },
});

function onMessage(e) {
  console.log(e);
  switch (e.type) {
    case "lobbyid":
      //server sent us a lobby id. now we can join it
      Client.joinServer(e.id);
      break;
    case "joined":
      State.MY_PID = e.gameID;
      Client.lobbyID = e.lobbyID;
      State.host = e.host;
      EventHandler.raiseEvent("joinlobby", { id: e.lobbyID });
      break;
    case "joinfailed":
      EventHandler.raiseEvent("joinfailed");
      break;
    case "permissions":
      State.host = e.host;
      break;
    case "playerlist":
      State.playerInfo = e.data;
      EventHandler.raiseEvent("updateplayerlist");
      break;
    case "startfailed":
      break;
    case "start":
      EventHandler.raiseEvent("start", { data: e.data });
      break;
    case "move":
      EventHandler.raiseEvent("makemove", e);
      break;
    case "end":
      EventHandler.raiseEvent("gameover", e);
      break;
    default:
      throw new Error(
        `invalid message '${JSON.stringify(e)}' recieved from server`,
      );
  }
}

function startJoin() {
  Client.sendUserInfo();
  Client.joinServer(UI.lobbyCode);
}

function startCreate() {
  Client.sendUserInfo();
  Client.getAvailableServerID();
}

function generateRandomUUID() {
  //base64
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890+/";
  // a satisfying one liner
  return Array.from(Array(UUID_LENGTH))
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("");
}

function startMatch() {
  if (!State.host) return;
  Client.sendData({ type: "matchstart", lobbyID: Client.lobbyID });
}

function addBot() {
  if (!State.host) return;
  Client.sendData({ type: "addbot" });
}

export { Client };
