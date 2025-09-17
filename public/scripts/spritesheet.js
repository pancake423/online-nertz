/*
make sprite sheets out of all of the possible card faces we need for the game.
also maintains a lookup of where to find each card face.

There are four 5x3 spritesheets.
There is space for up to 60 card faces- 52 for the fronts, and up to 8 players.
*/
import * as cr from "scripts/card-renderer.js";

let CARD_LOOKUP = {};
const SHEET_DIMENSIONS = [5, 3]; // 5 wide, 3 high (in cards)
const N_SHEETS = 4;
const PADDING = 2; // pixels
let SHEETS = [];
let SHEETS_CTX = [];
let idx = [0, 0, 0];
/*
initialize sprite sheets and add the 52 standard card faces.

playerCards is an array of [[color, design], ]
NOTE: must have 8 items or less, or this will break
*/
function makeSpriteSheets(playerCards) {
  // reset sprite sheets (in case of new games)
  idx = [0, 0, 0];
  CARD_LOOKUP = {};
  SHEETS = [];
  SHEETS_CTX = [];

  // initialize empty sprite sheets
  for (let i = 0; i < N_SHEETS; i++) {
    const c = new OffscreenCanvas(
      (cr.CARD_W + 2 * PADDING) * SHEET_DIMENSIONS[0],
      (cr.CARD_H + 2 * PADDING) * SHEET_DIMENSIONS[1],
    );
    SHEETS.push(c);
    SHEETS_CTX.push(c.getContext("2d"));
  }
  // add standard cards to spritesheets
  for (const suit of cr.FACE_SUITS) {
    for (const value of cr.FACE_VALUES) {
      addImageToSheet(cr.drawCardFace(suit, value), suit[0] + value);
    }
  }
  // add player cards to spritesheets
  for (let i = 0; i < playerCards.length; i++) {
    const [color, design] = playerCards[i];
    addImageToSheet(cr.drawCardBack(color, design), "p" + i);
  }
  // add empty slot to sheet
  addImageToSheet(cr.drawEmptySlot(), "empty");

  // return spritesheets as a list of image bitmaps.
  return SHEETS.map((c) => c.transferToImageBitmap());
}

/*
adds a new card image to the correct position in the spritesheet,
adds it to the card lookup table, and increments the spritesheet position.
*/
function addImageToSheet(img, loc) {
  const ctx = SHEETS_CTX[idx[0]];
  ctx.drawImage(
    img,
    idx[1] * (cr.CARD_W + 2 * PADDING) + PADDING,
    idx[2] * (cr.CARD_H + 2 * PADDING) + PADDING,
  );
  CARD_LOOKUP[loc] = idx;
  idx = nextIndex(idx);
}

/*
idx is a list of [sheet, x, y].
returns the new index of the next valid location.
*/
function nextIndex(idx) {
  let [sheet, x, y] = idx;
  y++;
  if (y >= SHEET_DIMENSIONS[1]) {
    y = 0;
    x++;
  }
  if (x >= SHEET_DIMENSIONS[0]) {
    x = 0;
    sheet++;
  }
  return [sheet, x, y];
}

function getFaceLoc(suit, value) {
  return CARD_LOOKUP[suit[0] + value];
}

function getBackLoc(playerID) {
  return CARD_LOOKUP["p" + playerID];
}

function getEmptyLoc() {
  return CARD_LOOKUP["empty"];
}

export {
  SHEET_DIMENSIONS,
  makeSpriteSheets,
  getFaceLoc,
  getBackLoc,
  getEmptyLoc,
};
