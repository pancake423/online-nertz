import { Game } from "./shared/game-logic.js";

const GAME_ID_LENGTH = 5;
const VALID_GAME_ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class GameServer {
  static clients = {}; // clientUUID -> {assignedGameID, assignedPID, cardDesign, cardColor}
  static games = {}; // GameID -> Game object

  // gets a random available game ID
  static getGameID() {
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
    // will start to hang with thousands of games created, but what are the odds lol
    // ~12m possible combinations
    while (Object.keys(this.games).includes(id)) {
      id = generateID();
    }
    return id;
  }

  static createGame(nPlayers) {}
}

export { GameServer };
