import { Game } from "./shared/game-logic.js";

const GAME_ID_LENGTH = 5;
const VALID_GAME_ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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
      players: [],
      host: undefined, // person with permission to delete players and start game
      game: undefined,
    };

    return true;
  }

  // adds a client to their game.
  // returns true if success, return false if failed.
  static assignClient(pid, id, username) {
    if (!Object.keys(this.lobbies).includes(id)) return false; // invalid game id
    const cardColors = ["red", "blue", "yellow", "black"];
    const playerN = this.lobbies[id].players.length;

    // TODO: enable re-assignment to an existing server by finding their player number
    // instead of adding a new one.
    if (playerN >= 3 || this.lobbies[id].players.includes(pid)) return false;

    this.clients[pid] = {
      lobby: id, // which lobby the player is currently in
      gameID: playerN, // player id within their assigned lobby,
      username: username, // player's display name
      cardDesign: "classic",
      cardColor: cardColors[playerN],
    };
    this.lobbies[id].players.push(pid);

    return true;
  }

  // creates a new game.
  // returns a JSON object containing all of the useful data that
  // we want to send back to the client(s).
  static startGame(id) {
    if (!Object.keys(this.lobbies).includes(id)) return;
    const lobby = this.lobbies[id];
    lobby.game = new Game(lobby.players.length);

    // TODO: send info back to the client differently
    // figure out a better way to do it
    return {
      nPlayers: lobby.players.length,
      cardDesigns: lobby.players.map((pid) => {
        const clientInfo = this.clients[pid];
        return {
          cardDesign: clientInfo.cardDesign,
          cardColor: clientInfo.cardColor,
        };
      }),
      playerHands: lobby.game.players.map((hand) => {
        return {
          workPiles: hand.workPiles,
          nertzPile: hand.nertzPile,
          stock: hand.stock,
        };
      }),
    };
  }
}

export { GameServer };
