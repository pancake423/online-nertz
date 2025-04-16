import { Game, PILES } from "../shared/game-logic.js";

// vector dot product
const dot = (a, b) => a.reduce((acc, v, i) => acc + v * b[i], 0);

// index of maximum value of a
const maxIdx = (a) =>
  a.reduce((acc, v, i, arr) => (arr[i] > arr[acc] ? i : acc), 0);

class Agent {
  static NUM_RULES = 7;

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
    let moves = this.allLegalMoves(game, pid);
    let weights = moves.map((m) => this.ruleMatches(game, m));
    // filters out useless moves (hopefully for good!)
    moves = moves.filter((v, i) => weights[i][0] != -1);
    weights = weights.filter((v, i) => v[0] != -1);
    const scores = weights.map((w) => dot(this.weights, w));
    return moves[maxIdx(scores)];
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
    const ruleFunctions = [
      this.r0,
      this.r1,
      this.r2,
      this.r3,
      this.r4,
      this.r5,
      this.r6,
    ];
    ruleFunctions.splice(Agent.NUM_RULES, Infinity);
    const nextState = game.clone();
    nextState.makeMove(move);
    if (isUselessMove(game, nextState, move))
      return ruleFunctions.map((f) => -1); // massively disincentivise useless moves hopefully
    return ruleFunctions.map((f) => f(game, nextState, move));
  }

  // Rules for basic strategy
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
    return openWorkPiles(after, move) > openWorkPiles(before, move) ? 1 : 0;
  }
  // rule 3: move stacks a card
  // count the total number of cards in work before and after
  // otherwise you accidentally incentivise shuffling back and forth
  r3(before, after, move) {
    return countStacks(after, move) > countStacks(before, move) ? 1 : 0;
  }
  // rule 4: move is a shuffle (to hopefully incentivise shuffling over randomly oscillating cards)
  r4(before, after, move) {
    return move[2] + move[4] == 7 ? 1 : 0;
  }
  // rules for advanced strategy
  // rule 5: playable card is visible
  // should allow for some foresight
  r5(before, after, move) {
    // find all top cards on foundation piles
    // find the next card in the sequence
    const nextCards = after.foundations
      .filter((f) => f.length > 0)
      .map((f) => f[f.length])
      .map((c) => nextCard(c));

    // check for any matches on the tops of your piles
    const player = after.players[move[0]];
    const piles = [...player.workPiles, player.nertzPile, player.waste];
    for (const pile of piles) {
      if (pile.length == 0) continue;
      const topCard = pile[pile.length - 1];
      for (const c of nextCards) {
        if (c[0] == topCard[0] && c[1] == topCard[1]) return 1;
      }
    }
    return 0;
  }

  // rule 6:  follow up moves
  // figure out if your opponent will be able to follow up your card played.
  r6(before, after, move) {
    if (move[4] != PILES.FOUNDATION) return 0;
    const followCard = nextCard(after.foundations[move[5]]);
    for (let i = 0; i < after.players.length; i++) {
      if (i == move[0]) continue;
      const player = after.players[i];
      const piles = [...player.workPiles, player.nertzPile, player.waste];
      for (const pile of piles) {
        if (pile.length == 0) continue;
        const topCard = pile[pile.length - 1];
        if (followCard[0] == topCard[0] && followCard[1] == topCard[1])
          return 1;
      }
    }
    return 0;
  }
}

function nextCard(suit, rank) {
  const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  return [suit, ranks[ranks.findIndex((n) => n == rank) + 1]];
}

function openWorkPiles(board, move) {
  const workPiles = board.players[move[0]].workPiles;
  for (const p of workPiles) {
    if (p.length == 0) return 1;
  }
  return 0;
}

function countStacks(board, move) {
  const workPiles = board.players[move[0]].workPiles;
  return workPiles.reduce((acc, v) => acc + v, 0);
}

// I need to stop the agents from moving cards back and forth aimlessly instead of shuffling.
function isUselessMove(before, after, move) {
  // any move between two work piles
  // where the top card in the from pile after
  // and the top card in the to pile before
  // are the same.

  if (!(move[2] == PILES.WORK && move[4] == PILES.WORK)) return false;
  if (before.players[move[0]].workPiles[move[5]].length == 0) return true;
  const fromPile = after.players[move[0]].workPiles[move[3]];
  const toPile = before.players[move[0]].workPiles[move[5]];
  if (fromPile.length == 0 && toPile.length == 0) return true; // means we're moving cards from one empty pile to another
  if (fromPile.length == 0 || toPile.length == 0) return false;
  if (fromPile[fromPile.length - 1][1] == toPile[toPile.length - 1][1]) {
    return true;
  }
  return false;
}

export { Agent };
