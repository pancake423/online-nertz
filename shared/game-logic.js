// modifiable rules. TODO: how to modify them dynamically?
let WORK_PILES = 4;
let NERTZ_PILE_SIZE = 13;
let STOCK_FLIP_AMT = 3; // number of cards to flip from stock to waste in each step.
const VALUES = [
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
const SUITS = ["spades", "hearts", "diamonds", "clubs"];

// budget enums :)
const COLORS = {
  BLACK: 0,
  RED: 1,
};
const PILES = {
  INVALID: -1,
  WORK: 0,
  NERTZ: 1,
  FOUNDATION: 2,
  STOCK: 3,
  WASTE: 4,
};

const SUIT_COLORS = {
  spades: COLORS.BLACK,
  clubs: COLORS.BLACK,
  hearts: COLORS.RED,
  diamonds: COLORS.RED,
};

class Deck {
  constructor(pid) {
    this.cards = [];
    for (const suit of SUITS) {
      for (const value of VALUES) {
        this.cards.push([suit, value, pid]);
      }
    }
  }
  drawRandom() {
    const idx = Math.floor(Math.random() * this.cards.length);
    return this.cards.splice(idx, 1)[0];
  }
  cardsRemaining() {
    return this.cards.length;
  }
}

class PlayerHand {
  constructor(pid) {
    const d = new Deck(pid);
    this.workPiles = [];
    for (let i = 0; i < WORK_PILES; i++) {
      this.workPiles.push([d.drawRandom()]);
    }
    this.nertzPile = [];
    for (let i = 0; i < NERTZ_PILE_SIZE; i++) {
      this.nertzPile.push(d.drawRandom());
    }
    this.stock = [];
    while (d.cardsRemaining() > 0) {
      this.stock.push(d.drawRandom());
    }
    this.waste = [];
  }
}

class Game {
  constructor(nPlayers) {
    this.players = [];
    for (let i = 0; i < nPlayers; i++) {
      const p = new PlayerHand(i);
      this.players.push(p);
    }
    this.foundations = [];
    for (let i = 0; i < nPlayers * 4; i++) {
      this.foundations.push([]);
    }
  }

  clone() {
    const out = new Game(0);
    out.players = structuredClone(this.players);
    out.foundations = structuredClone(this.foundations);
    return out;
  }

  checkValidMove(move) {
    const [pid, nCards, fromLoc, fromPile, toLoc, toPile] = move;
    // first check for valid PID
    if (pid < 0 || pid >= this.players.length) return false;
    // check for valid locations
    if (
      !this.#checkValidPile(fromLoc, fromPile) ||
      !this.#checkValidPile(toLoc, toPile)
    )
      return false;
    // you can only move one card at a time unless both the target and destination are work piles.
    if (
      nCards < 1 ||
      (nCards > 1 && (fromLoc != PILES.WORK || toLoc != PILES.WORK))
    )
      return false;

    // you can never take a card out of a foundation pile.
    if (fromLoc == PILES.FOUNDATION) return false;
    // you can never put a card onto a nertz pile.
    if (toLoc == PILES.NERTZ) return false;

    // move type: stock to waste. valid as long as there are cards in stock
    if (
      fromLoc == PILES.STOCK &&
      toLoc == PILES.WASTE &&
      this.getPileContents(pid, fromLoc, fromPile).length > 0
    )
      return true;
    // move type: waste to stock. only valid if there are no cards in stock
    if (
      fromLoc == PILES.WASTE &&
      toLoc == PILES.STOCK &&
      this.getPileContents(pid, toLoc, toPile).length == 0
    )
      return true;
    // otherwise, you can't put a card into stock or waste.
    if (toLoc == PILES.STOCK || toLoc == PILES.WASTE) return false;
    // you also can't move a card from stock to anywhere but waste
    if (fromLoc == PILES.STOCK) return false;
    /*
    move type: any other. the bottom card of the pile we are moving must "match"
    with the top card of the destination pile. if the destination pile is a work pile, that means alternating color and descending.
    otherwise, it must be matching suit and ascending.
    */
    const destPile = this.getPileContents(pid, toLoc, toPile);
    const startPile = this.getPileContents(pid, fromLoc, fromPile);
    // can't move cards from an empty pile :)
    // cant move more cards than are in a pile
    if (startPile.length == 0 || startPile.length < nCards) return false;
    const firstStartCard = startPile[startPile.length - nCards];
    // you can always move cards to an empty work pile. you can only move aces to empty foundation piles.
    if (destPile.length == 0) {
      if (toLoc == PILES.FOUNDATION && firstStartCard[1] != "A") {
        return false;
      } else return true;
    }
    const lastDestCard = destPile[destPile.length - 1];
    if (
      toLoc == PILES.WORK &&
      SUIT_COLORS[firstStartCard[0]] != SUIT_COLORS[lastDestCard[0]] &&
      // the last destination card is one higher than the first card that we moved
      VALUES.indexOf(lastDestCard[1]) - VALUES.indexOf(firstStartCard[1]) == 1
    )
      return true;
    if (
      toLoc == PILES.FOUNDATION &&
      firstStartCard[0] == lastDestCard[0] &&
      // the card we moved is one higher than the card its going on top of
      VALUES.indexOf(firstStartCard[1]) - VALUES.indexOf(lastDestCard[1]) == 1
    )
      return true;
    // not matching any of the valid cases, so must be invalid by default
    return false;
  }
  #checkValidPile(loc, pile) {
    switch (loc) {
      case PILES.NERTZ:
      case PILES.STOCK:
      case PILES.WASTE:
        return pile == 0; // there is only one of these piles
      case PILES.WORK:
        return pile >= 0 && pile < WORK_PILES;
      case PILES.FOUNDATION:
        return pile >= 0 && pile < this.foundations.length;
      default:
        return false; // loc is invalid, pile is automatically invalid
    }
  }
  getPileContents(pid, loc, pile) {
    switch (loc) {
      case PILES.NERTZ:
        return this.players[pid].nertzPile;
      case PILES.STOCK:
        return this.players[pid].stock;
      case PILES.WASTE:
        return this.players[pid].waste;
      case PILES.WORK:
        return this.players[pid].workPiles[pile];
      case PILES.FOUNDATION:
        return this.foundations[pile];
      default:
        throw new RangeError(
          `invalid loc value '${loc}' to Game.#getPileContents`,
        );
        return []; // how did you get here?
    }
  }

  makeMove(move) {
    const [pid, nCards, fromLoc, fromPile, toLoc, toPile] = move;
    if (!this.checkValidMove(move)) return;

    const to = this.getPileContents(pid, toLoc, toPile);
    const from = this.getPileContents(pid, fromLoc, fromPile);
    let nToMove = nCards;
    let reverse = false;

    // special moves
    // reset stock pile
    if (fromLoc == PILES.WASTE && toLoc == PILES.STOCK) {
      // move every card
      nToMove = from.length;
      reverse = true;
    }
    // move stock to waste
    if (fromLoc == PILES.STOCK && toLoc == PILES.WASTE) {
      // move STOCK_FLIP_AMT (unless there are less cards than that available)
      nToMove = Math.min(from.length, STOCK_FLIP_AMT);
      reverse = true;
    }

    // grab the number of cards necessary and move them to the new pile
    const moveCards = from.splice(from.length - nToMove, nToMove);
    if (reverse) moveCards.reverse();
    to.push(...moveCards);
  }

  // check if the game has ended (one player has cleared all their cards)
  checkEnd() {
    return this.players.map((p) => p.nertzPile.length).includes(0);
  }

  // gets the current score for each player
  getScores() {
    const scores = this.players.map((_) => 0);
    for (const pile of this.foundations) {
      for (const card of pile) {
        scores[card[2]]++;
      }
    }
    for (let i = 0; i < this.players.length; i++) {
      scores[i] -= this.players[i].nertzPile.length;
    }

    return scores;
  }
}

export { Game, PILES };
