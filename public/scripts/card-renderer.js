/*
module for rendering card faces and backs.

the images produced by this module will be stored in
spritesheets and loaded as textures into webgl in the future.
*/

// =============================================================
// CONSTANTS
// =============================================================
// program constants
const CARD_DIM_RATIO = [5, 7]; // width, height [9, 14] would also be acceptable (bridge cards)
const SCREEN_FRAC = 1 / 6; // approximate fraction of the screen that one card should take up (on one axis)
const FACE_SUITS = ["spades", "hearts", "diamonds", "clubs"]; // all allowed suits to drawCardFace function
const SUIT_INFO = {
  spades: ["\u{2660}", "black"],
  hearts: ["\u{2665}", "red"],
  diamonds: ["\u{2666}", "red"],
  clubs: ["\u{2663}", "black"],
};
const FACE_VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
]; // all allowed values to drawCardFace function
const BACK_DESIGNS = ["classic"]; // "circles", "waves", "zig-zags"
const CARD_ROUNDING_SIZE = 1 / 8; // controls how large the rounding of the corners of the cards is.
const CARD_STAMP_SIZE = 1 / 4; // size of the numbers and central symbols on each card.
const CARD_SMALL_STAMP_SIZE = 1 / 6; // size of the small suit symbols under the card value.
const CARD_PADDING_Y = 1 / 32; // spacing between symbols on the face of the card.
const CARD_PADDING_X = 0;
const CARD_LINE_THICKNESS = 1 / 32;
const CARD_LINE_SPACING = 1 / 6;

// constants that are defined at runtime
const [CARD_W, CARD_H] = getCardDimensions();

// =============================================================
// FUNCTIONS
// =============================================================
/*
determines the appropriate size, in pixels, to draw cards at based on the
size of the device's screen.

returns the largest integer multiple of CARD_DIM_RATIO that is smaller than
SCREEN_FRAC * the smaller screen dimension.
*/
function getCardDimensions() {
  const goalSize =
    Math.min(window.screen.width, window.screen.height) * SCREEN_FRAC;
  const scale = Math.floor(goalSize / Math.max(...CARD_DIM_RATIO));

  return CARD_DIM_RATIO.map((n) => n * scale);
}

/*
creates the path for a rounded rectangle.
ctx -> canvas rendering context
x, y, w, h -> position and size of the rectangle
r -> corner radius
*/
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, -Math.PI / 2);
}

function makeUnicodeStamp(char, size, color) {
  const c = new OffscreenCanvas(size, size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = color;
  ctx.font = `bold ${FACE_VALUES.includes(char) ? size * 0.8 : size}px Georgia`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, size / 2, size / 2);

  return c.transferToImageBitmap();
}

function rotateStamp(img, theta) {
  const c = new OffscreenCanvas(img.width, img.height);
  const ctx = c.getContext("2d");
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate(theta);
  ctx.translate(-c.width / 2, -c.height / 2);
  ctx.drawImage(img, 0, 0);

  return c.transferToImageBitmap();
}

function drawCardFace(suit, value) {
  // setup offscreen canvas
  const c = new OffscreenCanvas(CARD_W, CARD_H);
  const ctx = c.getContext("2d");

  // make suit and value stamps
  const color = SUIT_INFO[suit][1];
  const stampSize = Math.floor(CARD_W * CARD_STAMP_SIZE);
  const smallStampSize = Math.floor(CARD_W * CARD_SMALL_STAMP_SIZE);
  const roundingSize = Math.floor(CARD_W * CARD_ROUNDING_SIZE);
  const paddingX = Math.floor(CARD_W * CARD_PADDING_X);
  const paddingY = Math.floor(CARD_W * CARD_PADDING_Y);

  const suitStamp = makeUnicodeStamp(SUIT_INFO[suit][0], stampSize, color);
  const suitStampSmall = makeUnicodeStamp(
    SUIT_INFO[suit][0],
    smallStampSize,
    color,
  );
  const valueStamp = makeUnicodeStamp(value, stampSize, color);

  // draw the card background
  ctx.fillStyle = "white";
  roundedRect(ctx, 0, 0, CARD_W, CARD_H, roundingSize);
  ctx.fill();

  // stamp the card info
  ctx.drawImage(valueStamp, paddingX, paddingY);
  ctx.drawImage(
    suitStampSmall,
    paddingX + (stampSize - smallStampSize) / 2,
    paddingY + stampSize,
  );
  ctx.drawImage(
    rotateStamp(valueStamp, Math.PI),
    CARD_W - paddingX - stampSize,
    CARD_H - paddingY - stampSize,
  );
  ctx.drawImage(
    rotateStamp(suitStampSmall, Math.PI),
    CARD_W - paddingX - (stampSize - smallStampSize) / 2 - smallStampSize,
    CARD_H - paddingY - stampSize - smallStampSize,
  );

  return c.transferToImageBitmap();
}

function drawCardBack(color, design) {
  // setup canvas
  const c = new OffscreenCanvas(CARD_W, CARD_H);
  const ctx = c.getContext("2d");
  const roundingSize = Math.floor(CARD_W * CARD_ROUNDING_SIZE);
  const lineSize = Math.floor(CARD_W * CARD_LINE_THICKNESS);
  const lineSpacing = Math.floor(CARD_W * CARD_LINE_SPACING);

  // fill background, draw border
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.strokeStyle = "white";
  ctx.lineWidth = lineSize;
  roundedRect(ctx, 0, 0, CARD_W, CARD_H, roundingSize);
  ctx.stroke();

  // draw design
  switch (design) {
    case "classic":
      // draw diagonal lines across the card
      ctx.beginPath();
      for (let i = 0; i < CARD_W; i += CARD_W * CARD_LINE_SPACING) {
        const lines = [
          [
            [0, 0],
            [CARD_W, CARD_H],
          ],
          [
            [CARD_W, 0],
            [0, CARD_H],
          ],
        ];
        const offsets = [i, -i];
        for (const line of lines) {
          for (const d of offsets) {
            ctx.moveTo(line[0][0] + d, line[0][1]);
            ctx.lineTo(line[1][0] + d, line[1][1]);
          }
        }
      }
      ctx.stroke();
      break;
  }

  // ensure that pixels are only drawn in the correct area
  const mask = new OffscreenCanvas(CARD_W, CARD_H);
  const maskCtx = mask.getContext("2d");
  roundedRect(maskCtx, 0, 0, CARD_W, CARD_H, roundingSize);
  maskCtx.fill();
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(mask.transferToImageBitmap(), 0, 0);

  return c.transferToImageBitmap();
}

// =============================================================
// EXPORTS
// =============================================================
export {
  CARD_W,
  CARD_H,
  FACE_SUITS,
  FACE_VALUES,
  BACK_DESIGNS,
  drawCardFace,
  drawCardBack,
};
