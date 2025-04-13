import { Game, PILES } from "../shared/game-logic.js";

// vector dot product
const dot = (a, b) => a.reduce((acc, v, i) => acc + v * b[i], 0);

// index of maximum value of a
const maxIdx = (a) =>
  a.reduce((acc, v, i, arr) => (arr[i] > arr[acc] ? i : acc), 0);

class Agent {
  static NUM_RULES = 4;

  /*
  weights: array[int]
  */
  constructor(weights) {
    this.weights = weights.map((n) => n); // copy array instead of by reference
    this.score = 0;
    this.wins = 0;
  }

  reset() {
    this.score = 0;
    this.wins = 0;
  }

  /*
  game: Game() instance
  pid: int [0, 3] representing which player's turn it is

  computes the best move according to this agent.
  returns a move (array[int] of length 6)
  */
  getMove(game, pid) {
    const moves = this.allLegalMoves(game, pid);
    const weights = moves.map((m) =>
      dot(this.weights, this.ruleMatches(game, m)),
    );
    return moves[maxIdx(weights)];
  }

  /*
  game: Game() instance

  returns a list of all legal moves that the given player can
  make in the given position.
  */
  allLegalMoves(game, pid) {
    // move syntax:
    //[pid, nCards, fromLoc, fromPile, toLoc, toPile]
    // pid: player id
    // nCards: number of cards to move
    // fromLoc: starting location type {work pile, nertz pile, etc.}
    // fromPile: starting pile number (ie. 0-3 for work piles, 0-7 for foundation piles. usually zero.)
    // toLoc: destination location type
    // toPile: destination pile number

    const legalMoves = [];
    // this is probably the first 5-nested for loop I've ever written lol
    const numPiles = [4, 1, game.players.length * 4, 1, 1];
    for (let fromLoc = 0; fromLoc <= 4; fromLoc++) {
      for (let toLoc = 0; toLoc <= 4; toLoc++) {
        for (let fromPile = 0; fromPile < numPiles[fromLoc]; fromPile++) {
          for (let toPile = 0; toPile < numPiles[toLoc]; toPile++) {
            const maxNumCards =
              fromLoc == PILES.WORK && toLoc == PILES.WORK ? 13 : 1;
            for (let nCards = 1; nCards <= maxNumCards; nCards++) {
              const move = [pid, nCards, fromLoc, fromPile, toLoc, toPile];
              if (game.checkValidMove(move)) {
                legalMoves.push(move);
              }
            }
          }
        }
      }
    }
    return legalMoves;
  }

  /*
  returns array[int] representing the rules that the move matches.
  */
  ruleMatches(game, move) {
    const ruleFunctions = [this.r0, this.r1, this.r2, this.r3];
    ruleFunctions.splice(Agent.NUM_RULES, Infinity);
    const nextState = game.clone();
    nextState.makeMove(move);
    return ruleFunctions.map((f) => f(game, nextState, move));
  }

  // rule 0: move plays a card to a foundation pile
  r0(before, after, move) {
    return move[4] == PILES.FOUNDATION ? 1 : 0;
  }
  // rule 1: move takes a card out of the nertz pile
  r1(before, after, move) {
    return move[2] == PILES.NERTZ ? 1 : 0;
  }
  // rule 2: move opens a work pile
  r2(before, after, move) {
    const workPiles = after.players[move[0]].workPiles;
    for (const p of workPiles) {
      if (p.length == 0) return 1;
    }
    return 0;
  }
  // rule 3: move stacks a card
  r3(before, after, move) {
    if (move[4] != 0) return false;
    const s = before.players[move[0]].workPiles[move[5]];
    const e = after.players[move[0]].workPiles[move[5]];

    return e - s > 0 ? 1 : 0;
  }
}

export { Agent };
