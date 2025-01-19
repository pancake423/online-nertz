import * as ss from "/scripts/spritesheet.js";
import { mat3, mat4 } from "/gl-matrix/index.js"; // for future reference
import { Game } from "/shared/game-logic.js";
import * as renderer from "/scripts/gl-renderer.js";

var c;
var ctx;

const g = new Game(4);
console.log(g);

window.onload = () => {
  renderer.init(document.getElementById("c")).then(() => {
    renderer.setCamera(4);
    renderer.clear();

    const spriteSheets = ss.makeSpriteSheets([
      ["blue", "classic"],
      ["red", "classic"],
    ]);

    renderer.loadTextures(spriteSheets, ss.SHEET_DIMENSIONS);

    renderer.drawCard(
      [0, 0, 2.5], // note that cards are meant to be drawn with a depth equal to half the width of the playing area
      [0, 0, 50],
      ss.getFaceLoc("hearts", "A"),
      ss.getBackLoc(1),
    );
    renderer.drawCard(
      [0.1, 0.5, 2.3],
      [0, 180, 0],
      ss.getFaceLoc("hearts", "A"),
      ss.getBackLoc(0),
    );
  });
};
