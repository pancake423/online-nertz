import { PILES } from "/shared/game-logic.js";
/*
recieves updates from card interaction, tells renderer what to do
makes moves when cards are dropped in the right ways.

ive tried like 10 different styles for programming w/ modules,
now back to classes (I think I prefer this, its at least consistent)

code is admittedly not the cleanest at this point, but it's good enough
and more important to finish the project than waste a ton of time refactoring
*/
class MoveTracker {
  // can optionally be defined in the constructor or later w/ init
  constructor(renderer, game, eventHandler) {
    this.pid = -1;
    this.nCards = -1;
    this.fromLoc = -1;
    this.fromPile = -1;
    this.toLoc = -1;
    this.toPile = -1;
    this.init(renderer, game, eventHandler);
  }
  init(renderer, game, eventHandler) {
    this.r = renderer;
    this.g = game;
    this.e = eventHandler;
  }
  startMove(e) {
    this.pid = e.pid;
    this.nCards = e.nCards; // TODO: get this information from the click dynamically
    this.fromLoc = e.loc;
    this.fromPile = e.pile;
    this.r.startCardDrag(...this.#getMove().slice(0, 4));
    this.r.setDragPos(e.x, e.y);
  }
  updatePos(e) {
    this.r.setDragPos(e.x, e.y);
  }
  endMove(e) {
    this.toLoc = e.loc;
    this.toPile = e.pile;
    this.r.endCardDrag();
    // attempt to make the move, if valid
    const move = this.#getMove();
    if (game.checkValidMove(move)) {
      this.e.raiseEvent("makemove", { move: move });
    }
  }

  #getMove() {
    return [
      this.pid,
      this.nCards,
      this.fromLoc,
      this.fromPile,
      this.toLoc,
      this.toPile,
    ];
  }
}

export { MoveTracker };
