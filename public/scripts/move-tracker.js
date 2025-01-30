import { PILES } from "/shared/game-logic.js";
import { EventHandler } from "/scripts/events.js";
import * as renderer from "/scripts/draw.js";
import { State } from "/scripts/state.js";
/*
recieves updates from card interaction, tells renderer what to do
makes moves when cards are dropped in the right ways.

ive tried like 10 different styles for programming w/ modules,
now back to classes (I think I prefer this, its at least consistent)

code is admittedly not the cleanest at this point, but it's good enough
and more important to finish the project than waste a ton of time refactoring
*/
// move tracker listens for card interaction events
EventHandler.addEventListener("selectpile", (e) => MoveTracker.startMove(e));
EventHandler.addEventListener("movepile", (e) => MoveTracker.updatePos(e));
EventHandler.addEventListener("releasepile", (e) => MoveTracker.endMove(e));

class MoveTracker {
  // can optionally be defined in the constructor or later w/ init
  static pid = -1;
  static nCards = -1;
  static fromLoc = -1;
  static fromPile = -1;
  static toLoc = -1;
  static toPile = -1;

  static startMove(e) {
    this.pid = e.pid;
    this.nCards = e.nCards; // TODO: get this information from the click dynamically
    this.fromLoc = e.loc;
    this.fromPile = e.pile;
    renderer.startCardDrag(...this.#getMove().slice(0, 4));
    renderer.setDragPos(e.x, e.y);
  }
  static updatePos(e) {
    renderer.setDragPos(e.x, e.y);
  }
  static endMove(e) {
    this.toLoc = e.loc;
    this.toPile = e.pile;
    renderer.endCardDrag();
    // attempt to make the move, if valid
    const move = this.#getMove();
    if (State.game.checkValidMove(move)) {
      EventHandler.raiseEvent("makemove", { move: move });
    }
  }

  static #getMove() {
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
