/*
 online Nertz replica
 made by pancake423

 just for fun:
 for line count (excludes glMatrix code, .json files)
 git ls-files | grep -v -e .json -e gl-matrix | xargs wc -l

*/

import { Game } from "/shared/game-logic.js";
import * as renderer from "/scripts/draw.js";
import { EventHandler } from "/scripts/events.js";
import * as cardInteraction from "/scripts/card-interaction.js";
import { MoveTracker } from "/scripts/move-tracker.js"; // importing these register events
import { State } from "/scripts/state.js";
import { Client } from "/scripts/client.js";
import { UI } from "/scripts/ui.js";

// some networking code eventually is going to handle the event when you request to make a move
EventHandler.addEventListener("makemove", (e) => State.game.makeMove(e.move));

// put modules into global namespace (for debug/testing)
window.State = State;
window.Client = Client;
window.UI = UI;

window.onload = async () => {
  await renderer.init();
  cardInteraction.init();
  renderer.drawBackground();
  Client.connect();
  UI.getPrefilledValues();

  main();
};

function start() {
  State.game = new Game(2);
  renderer.initGame([
    ["blue", "classic"],
    ["red", "classic"],
    //["yellow", "classic"],
    //["green", "classic"],
  ]);
  main();
}

// main game loop.
function main() {
  if (State.paused) {
    renderer.drawBackground();
  } else {
    renderer.draw();
  }
  requestAnimationFrame(main);
}
