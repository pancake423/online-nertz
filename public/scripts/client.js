import { State } from "/scripts/state.js";
import { EventHandler } from "/scripts/events.js";

const UUID_LENGTH = 16;

// "public" methods are created as object members
// "private" ones are just non-exported class methods.
const Client = Object.seal({
  UUID: generateRandomUUID(),
  // serverID: undefined,
  webSocket: undefined,

  getAvailableServerID: async () => {
    return await send("/id", "GET");
  },
  createServer: async (id) => {
    return await send("/create", "POST", {
      id: id,
      uuid: Client.UUID,
      username: State.username,
    });
  },
  joinServer: async (id) => {
    res = await send("/join", "POST", {
      id: id,
      uuid: Client.UUID,
      username: State.username,
    });
    if (!res.accepted) return res;
    // connect to web socket
    // as soon as we've successfully joined a server we need to start using real time communication.
    Client.webSocket = new WebSocket("/");
    Client.webSocket.onmessage = (e) =>
      EventHandler.raiseEvent("message", JSON.parse(e.data));
  },

  sendData: (data) => {
    // ensure that uuid is send with data
    Client.webSocket.send();
  },
});

async function send(path, method, body) {
  const options = {
    method: method,
    headers: { "Content-type": "application/json" },
  };
  if (method == "POST" && body != undefined) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(path, options).then((res) => res.json());
  return response;
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

export { Client };
