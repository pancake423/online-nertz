import * as cr from "/scripts/card-renderer.js";
import { mat3, mat4 } from "/gl-matrix/index.js"; // for future reference

var c;
var ctx;

console.log("1" in cr.FACE_VALUES);

window.onload = () => {
  c = document.getElementById("c");
  ctx = c.getContext("2d");

  ctx.drawImage(cr.drawCardFace("hearts", "A"), 16, 16);
  ctx.drawImage(cr.drawCardFace("diamonds", "10"), 32 + cr.CARD_W, 16);
  ctx.drawImage(cr.drawCardFace("clubs", "A"), 16, 32 + cr.CARD_H);
  ctx.drawImage(
    cr.drawCardFace("spades", "10"),
    32 + cr.CARD_W,
    32 + cr.CARD_H,
  );
  ctx.drawImage(
    cr.drawCardBack("red", "classic"),
    48 + cr.CARD_W * 2,
    32 + cr.CARD_H,
  );
  ctx.drawImage(cr.drawCardBack("blue", "classic"), 48 + cr.CARD_W * 2, 16);
};
