import { Game } from "/shared/game-logic.js";
import * as renderer from "/scripts/draw.js";

var c;
var ctx;

window.onload = async () => {
  await renderer.init();

  renderer.initGame([
    ["blue", "classic"],
    ["red", "classic"],
    ["yellow", "classic"],
    //["green", "classic"],
  ]);

  const g = new Game(3);
  renderer.draw(g, 0);
};
