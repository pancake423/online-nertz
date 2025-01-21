const WORK_PILES = 4;
const NERTZ_PILE_SIZE = 13;
const STOCK_FLIP_AMT = 3; // number of cards to flip from stock to waste in each step.
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
}

export { Game };
