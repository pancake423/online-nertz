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
  main();
}

function loadGame(dataString) {
  const data = JSON.parse(dataString);
  State.paused = false;
  State.game = new Game(data.deal.length);
  State.game.players = data.deal;
  moveList = data.moves;
  renderer.initGame(
    [
      ["blue", "classic"],
      ["red", "classic"],
      ["yellow", "classic"],
      ["green", "classic"],
    ].slice(4 - data.deal.length, Infinity),
  );
}
window.loadGame = loadGame;

function nextMove() {
  State.game.makeMove(moveList[moveIdx]);
  moveIdx++;
}
window.nextMove = nextMove;
window.moveList = moveList;
window.State = State;

// main game loop.
function main() {
  if (State.paused) {
    renderer.drawBackground();
  } else {
    renderer.draw();
  }
  requestAnimationFrame(main);
}
