import * as gameLogic from "/shared/game-logic.js";
import * as renderer from "/scripts/draw.js";

var c;
var ctx;

const g = new gameLogic.Game(2);

// put modules into global namespace
window.renderer = renderer;
window.gameLogic = gameLogic;
window.g = g;

window.onload = async () => {
  await renderer.init();

  renderer.initGame([
    ["blue", "classic"],
    ["red", "classic"],
    //["yellow", "classic"],
    //["green", "classic"],
  ]);

  renderer.draw(g, 0);
};
