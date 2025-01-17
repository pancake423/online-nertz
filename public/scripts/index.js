import * as ss from "/scripts/spritesheet.js";
import { mat3, mat4 } from "/gl-matrix/index.js"; // for future reference
import { Game } from "/shared/game-logic.js";

var c;
var ctx;

const g = new Game(4);
console.log(g);

window.onload = () => {
  c = document.getElementById("c");
  ctx = c.getContext("2d");

  const spriteSheets = ss.makeSpriteSheets([
    ["blue", "classic"],
    ["red", "classic"],
  ]);
  console.log(ss.getFaceLoc("hearts", "3"));
  console.log(ss.getBackLoc(1));

  for (let i = 0; i < spriteSheets.length; i++) {
    ctx.drawImage(
      spriteSheets[i],
      (spriteSheets[i].width / 2) * Math.floor(i / 2),
      (spriteSheets[i].height / 2) * (i % 2),
      spriteSheets[i].width / 2,
      spriteSheets[i].height / 2,
    );
  }
};
