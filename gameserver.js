import { Game } from "./shared/game-logic.js";

const GAME_ID_LENGTH = 5;
const VALID_GAME_ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function send(ws, data) {
  ws.send(JSON.stringify(data));
}

class GameServer {
  static clients = {}; // clientUUID -> {assignedGameID, assignedPID, cardDesign, cardColor}
  static lobbies = {}; // GameID -> Game object

  // gets a random available lobby ID
  static getLobbyID() {
    const generateID = () => {
      let out = "";
      for (let _ = 0; _ < GAME_ID_LENGTH; _++) {
        out += VALID_GAME_ID_CHARS.charAt(
          Math.floor(Math.random() * VALID_GAME_ID_CHARS.length),
        );
      }
      return out;
    };

    let id = generateID();
    // will start to hang with millions of games created, but what are the odds lol
    // ~12m possible combinations
    while (Object.keys(this.lobbies).includes(id)) {
      id = generateID();
    }
    return id;
  }

  // creates a lobby with the given id, if possible.
  // returns true if success, return false if failed.
  static createLobby(id) {
    if (Object.keys(this.lobbies).includes(id)) return false;

    this.lobbies[id] = {
      players: [undefined, undefined, undefined, undefined],
      host: undefined, // person with permission to delete players and start game
      game: undefined,
    };

    return true;
  }

  // creates a new client and ties their websocket and pid
  static newClient(pid, ws) {
    this.clients[pid] = {
      ws: ws,
      lobby: undefined, // which lobby the player is currently in
      gameID: undefined, // player id within their assigned lobby,
      username: undefined, // player's display name
      cardDesign: undefined,
      cardColor: undefined,
    };
  }
  // updates a client's display info.
  static setClientInfo(pid, info) {
    //make sure client actually exists so we don't crash the server
    if (!(pid in this.clients)) return false;
    const c = this.clients[pid];
    const properties = ["username", "cardDesign", "cardColor"];
    for (const p of properties) {
      c[p] = info[p];
    }
    return true;
  }

  // removes a client from the pool when they disconnect.
  static disconnect(ws) {
    for (const uuid in this.clients) {
      if (ws === this.clients[uuid].ws) {
        // remove client from lobby as well
        this.leaveLobby(uuid, this.clients[uuid].lobby);
        delete this.clients[uuid];
      }
    }
  }

  static updatePlayerList(id) {
    let players = []; // {username, gameID, deck color, deck pattern}

    const lobby = this.lobbies[id];
    for (const pid of lobby.players) {
      if (pid == undefined) continue;
      const player = this.clients[pid];
      players.push({
        username: player.username,
        gameID: player.gameID,
        cardDesign: player.cardDesign,
        cardColor: player.cardColor,
        host: pid == lobby.host,
      });
    }
    for (const pid of lobby.players) {
      if (pid == undefined) continue;
      send(this.clients[pid].ws, { type: "playerlist", data: players });
    }
  }

  // removes a client from a lobby when they leave or disconnect
  // TODO: might be bugged (haven't figured out how to replicate the crash yet)
  static leaveLobby(pid, id) {
    const lobby = this.lobbies[id];

    // remove player from lobby
    for (let i = 0; i < lobby.players.length; i++) {
      if (lobby.players[i] == pid) {
        lobby.players[i] = undefined;
      }
    }

    // check if player is host
    if (lobby.host == pid) {
      lobby.host = undefined;
      // look for other players in lobby
      let nextPlayer = undefined;
      for (const p of lobby.players) {
        if (p != undefined) {
          nextPlayer = p;
          break;
        }
      }
      if (nextPlayer == undefined) {
        // lobby is empty and can be deleted
        delete this.lobbies[id];
        return; // stops the function from trying to update the player list of a now empty server.
      } else {
        //upgrade someone else to host
        lobby.host = nextPlayer;
        send(this.clients[lobby.host].ws, { type: "permissions", host: true });
      }
    }

    // send a message to other players updating the player list
    this.updatePlayerList(id);
  }

  // adds a client to their game.
  // returns true if success, return false if failed.
  static assignClient(pid, id) {
    if (!Object.keys(this.lobbies).includes(id))
      return { ok: false, reason: "invalid" }; // invalid game id
    let playerN = 0;
    const players = this.lobbies[id].players;
    while (playerN <= 3 && players[playerN] != undefined) playerN++;

    if (playerN > 3 || players.includes(pid))
      return { ok: false, reason: "full" };

    const c = this.clients[pid];
    c.lobby = id;
    c.gameID = playerN;
    players[playerN] = pid;

    let host = false;
    if (this.lobbies[id].host == undefined) {
      host = true;
      this.lobbies[id].host = pid;
    }
    return { ok: true, gameID: playerN, host: host };
  }

  static startGame(id, pid) {
    if (!Object.keys(this.lobbies).includes(id))
      return { ok: false, reason: "invalid" }; // invalid game id
    if (this.lobbies[id].host != pid) {
      return { ok: false, reason: "nothost" }; // only host can start game
    }
    const lobby = this.lobbies[id];
    const playerCount = lobby.players.filter((n) => n != undefined).length;
    console.log(playerCount);
    if (playerCount < 2) {
      return { ok: false, reason: "notenoughplayers" }; // need at least 2 players
    }

    lobby.game = new Game(playerCount);
    // send data to everyone in the lobby
    for (const uuid of lobby.players) {
      if (uuid == undefined) continue;
      send(this.clients[uuid].ws, { type: "start", data: lobby.game.players });
    }
    return { ok: true };
  }
}

export { GameServer };
