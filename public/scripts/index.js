/*
 online Nertz replica
 made by pancake423

 just for fun:
 for line count (excludes glMatrix code)
 git ls-files | grep -v gl-matrix |  xargs wc -l

 just broke 1500 lines!
*/

import { Game } from "/shared/game-logic.js";
import * as renderer from "/scripts/draw.js";
import { EventHandler } from "/scripts/events.js";
import * as cardInteraction from "/scripts/card-interaction.js";
import { MoveTracker } from "/scripts/move-tracker.js"; // importing this registers its events
import { State } from "/scripts/state.js";
import { Client } from "/scripts/client.js";

// some networking code eventually is going to handle the event when you request to make a move
EventHandler.addEventListener("makemove", (e) => State.game.makeMove(e.move));

// put modules into global namespace (for debug/testing)
window.State = State;
window.Client = Client;

window.onload = async () => {
  await renderer.init();

  State.game = new Game(4);
  renderer.initGame([
    ["blue", "classic"],
    ["red", "classic"],
    ["yellow", "classic"],
    ["green", "classic"],
  ]);
  cardInteraction.init();
  main();
};

// main game loop.
function main() {
  renderer.draw();
  requestAnimationFrame(main);
}
