import { Game } from "/shared/game-logic.js";
import * as renderer from "/scripts/draw.js";
import { State } from "/scripts/state.js";

let moveList = [];
let moveIdx = 0;

window.onload = async () => {
  await renderer.init();
  renderer.drawBackground();

  start();
};

function start() {
  State.paused = false;
  State.game = new Game(4);
  renderer.initGame([
    ["blue", "classic"],
    ["red", "classic"],
    ["yellow", "classic"],
    ["green", "classic"],
  ]);
  console.log(renderer.getPileCoords(0, 0, 0));
  main();
}

function loadGame(dataString) {
  const data = JSON.parse(dataString);
  State.game.players = data.deal;
  moveList = data.moves;
}
window.loadGame = loadGame;

function nextMove() {
  State.game.makeMove(moveList[moveIdx]);
  moveIdx++;
}
window.nextMove = nextMove;

// main game loop.
function main() {
  if (State.paused) {
    renderer.drawBackground();
  } else {
    renderer.draw();
  }
  requestAnimationFrame(main);
}
