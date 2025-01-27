import * as gameLogic from "/shared/game-logic.js";
import * as renderer from "/scripts/draw.js";
import { EventHandler } from "/scripts/events.js";
import * as cardInteraction from "/scripts/card-interaction.js";
import { MoveTracker } from "/scripts/move-tracker.js";

const MY_PID = 0; // will be dynamically determined once there is an actual server
const game = new gameLogic.Game(4); // same here
const moveTracker = new MoveTracker();

//===== register events and interactions =====
/*
easiest to do this all in index.js IMO so that they're all in one place and
its easier to coordinate the right data getting to the right places
*/
const eventHandler = new EventHandler();
// card interaction listens for mouse events
eventHandler.addEventListener("mousedown", (e) =>
  cardInteraction.onMouseDown(game, MY_PID, e),
);
eventHandler.addEventListener("mouseup", (e) =>
  cardInteraction.onMouseUp(game, MY_PID, e),
);
eventHandler.addEventListener("mousemove", (e) =>
  cardInteraction.onMouseMove(MY_PID, e),
);
eventHandler.addEventListener("blur", (e) => cardInteraction.onBlur(MY_PID, e));
// move tracker listens for card interaction events
eventHandler.addEventListener("selectpile", (e) => moveTracker.startMove(e));
eventHandler.addEventListener("movepile", (e) => moveTracker.updatePos(e));
eventHandler.addEventListener("releasepile", (e) => moveTracker.endMove(e));
// some networking code eventually is going to handle the event when you request to make a move
eventHandler.addEventListener("makemove", (e) => game.makeMove(e.move));

// put modules into global namespace (for debug/testing)
window.gameLogic = gameLogic;
window.game = game;

window.onload = async () => {
  await renderer.init();

  renderer.initGame([
    ["blue", "classic"],
    ["red", "classic"],
    ["yellow", "classic"],
    ["green", "classic"],
  ]);
  // needs to pull window dimensions from renderer
  // so it can figure out where cards are
  cardInteraction.init(renderer, eventHandler);
  moveTracker.init(renderer, game, eventHandler);
  main();
};

// main game loop.
function main() {
  renderer.draw(game, MY_PID);
  requestAnimationFrame(main);
}
