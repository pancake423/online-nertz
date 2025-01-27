import * as glr from "/scripts/gl-draw.js";
import * as ss from "/scripts/spritesheet.js";
import { CARD_W, CARD_H } from "/scripts/card-renderer.js";

// scaling factor on canvases for performance reasons.
// higher number = more scaling = lower res
let RENDER_SCALE = 1;
// z depth at which object should be rendered. determined by nr of players in the game.
let DEPTH = 0;
// dimensions of the grid where foundation piles are rendered.

const PADDING = 0.5; //unit is card height. Gap between separate blocks of cards
const STACK_OFFSET = 0.15; // gap between cards that are associated together
const CARD_OFFSET = 0.15;
const CARD_THICKNESS = 0.008; // in z units

const ANIM_SCALE_FACTOR = 1.25; // how much larger should cards look when picked up by one unit

const BG_COLOR = "#2E7D32";
const BG_ACCENT_COLOR = "#1B5E20";

let PLAYER_SIZE = 0;
let CENTER_SIZE = 0;
let SIZE = 0;

let bgCanvas;
let bgctx;
let glCanvas;

async function init() {
  bgCanvas = document.getElementById("bg");
  bgctx = bgCanvas.getContext("2d");
  glCanvas = document.getElementById("c");
  setCanvasSize();

  await glr.init(glCanvas);
  window.onresize = () => {
    setCanvasSize();
    glr.updateWindowSize();
  };
}

function setCanvasSize() {
  const d = Math.min(window.innerWidth, window.innerHeight);
  for (const c of [bgCanvas, glCanvas]) {
    c.width = d / RENDER_SCALE;
    c.height = d / RENDER_SCALE;
  }
}

function initDrawSpace(cardInfo) {
  const nPlayers = cardInfo.length;

  // FIGURE OUT NEEDED SIZE OF THE PLAYING AREA
  // sorry for yelling I had to rewrite this code three times
  PLAYER_SIZE = Math.max(CARD_OFFSET * 13 + 1, PADDING + 2 + STACK_OFFSET);
  CENTER_SIZE =
    PADDING * 2 + Math.max(getTotalSize(4, true), getTotalSize(nPlayers));
  if (nPlayers == 2) {
    CENTER_SIZE = PADDING * 2 + getTotalSize(2);
  }
  SIZE = PLAYER_SIZE * 2 + CENTER_SIZE;

  DEPTH = ANIM_SCALE_FACTOR / (ANIM_SCALE_FACTOR - 1);
  const theta = 2 * Math.atan(SIZE / (2 * DEPTH));
  glr.setCamera(theta, DEPTH * 2);
}

function getTotalSize(nCards, xAxis = false) {
  return nCards * (xAxis ? CARD_W / CARD_H : 1) + (nCards - 1) * STACK_OFFSET;
}

// TODO: are these canvas space pixels or actual screen space pixels?
function pixelToScreen(x, y) {
  return [0, 0];
}

function ScreenToGl(x, y) {
  return [SIZE / 2 - x, SIZE / 2 - y];
}

function initGame(cardInfo) {
  initDrawSpace(cardInfo);

  const spriteSheets = ss.makeSpriteSheets(cardInfo);
  glr.loadTextures(spriteSheets, ss.SHEET_DIMENSIONS);
}

function drawPile(x, y, cards, rot, origin, offset = 0) {
  if (cards.length == 0) {
    glr.drawCard(
      [x, y, DEPTH],
      rot,
      origin,
      ss.getEmptyLoc(),
      ss.getEmptyLoc(),
    );
  }
  const theta = toRadians(rot[2] - 90);
  const dx = Math.cos(theta) * offset;
  const dy = Math.sin(theta) * offset;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    glr.drawCard(
      [x + dx * i, y + dy * i, DEPTH - CARD_THICKNESS * i],
      rot,
      origin,
      ss.getFaceLoc(card[0], card[1]),
      ss.getBackLoc(card[2]),
    );
  }
}

function draw(game, myPID) {
  const nPlayers = game.players.length;
  const cardWidth = CARD_W / CARD_H;
  drawBackground();
  glr.clear();

  // draw the foundation piles
  let x = PLAYER_SIZE;
  let y = PLAYER_SIZE;
  let maxW = CENTER_SIZE;
  let maxH = CENTER_SIZE;

  let w = getTotalSize(4, true);
  let h = getTotalSize(nPlayers);

  x += (maxW - w + cardWidth) / 2;
  y += (maxH - h + 1) / 2;

  for (let i = 0; i < game.foundations.length; i++) {
    const dx = (i % 4) * (cardWidth + STACK_OFFSET);
    const dy = Math.floor(i / 4) * (1 + STACK_OFFSET);
    drawPile(
      ...ScreenToGl(x + dx, y + dy),
      game.foundations[i],
      [0, 0, 0],
      [0, 0, 0],
    );
  }

  // draw the player hands
  const positions = ["left", "right", "top", "bottom"];
  drawPlayerHand(game.players[myPID], positions.pop());
  for (let i = 0; i < nPlayers; i++) {
    if (i == myPID) continue;
    drawPlayerHand(game.players[i], positions.pop());
  }
}

function drawPlayerHand(hand, pos) {
  let [[x, y], [dx, dy], theta] = getPos(pos);
  const cardWidth = CARD_W / CARD_H;
  const nPiles = hand.workPiles.length;
  x -= ((getTotalSize(nPiles + 1, true) - cardWidth) * dx) / 2;
  y -= ((getTotalSize(nPiles + 1, true) - cardWidth) * dy) / 2;

  for (let i = 0; i < nPiles; i++) {
    drawPile(
      ...ScreenToGl(x, y),
      hand.workPiles[i],
      [0, 0, theta],
      [0, 0, 0],
      CARD_OFFSET,
    );
    x += (cardWidth + STACK_OFFSET) * dx;
    y += (cardWidth + STACK_OFFSET) * dy;
  }
  drawPile(...ScreenToGl(x, y), hand.nertzPile, [0, 0, theta], [0, 0, 0]);
  x += (1 + STACK_OFFSET) * dy;
  y += (1 + STACK_OFFSET) * dx;
  drawPile(...ScreenToGl(x, y), hand.stock, [0, 180, theta], [0, 0, 0]);
  x += (cardWidth + STACK_OFFSET) * dx;
  y += (cardWidth + STACK_OFFSET) * dy;
  drawPile(...ScreenToGl(x, y), hand.waste, [0, 0, theta], [0, 0, 0]);
}

function getPos(p) {
  switch (p) {
    case "bottom":
      return [[SIZE / 2, SIZE - PLAYER_SIZE + 0.5], [1, 0], 0];
    case "top":
      return [[SIZE / 2, PLAYER_SIZE - 0.5], [-1, 0], 0];
    case "left":
      return [[PLAYER_SIZE - 0.5, SIZE / 2], [0, -1], 90];
    case "right":
      return [[SIZE - PLAYER_SIZE + 0.5, SIZE / 2], [0, 1], 90];
  }
}

function toDegrees(rad) {
  return (180 * rad) / Math.PI;
}
function toRadians(deg) {
  return (Math.PI * deg) / 180;
}

function drawBackground() {
  const ctx = bgctx;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
}

function getLayout() {
  return {
    PLAYER_SIZE: PLAYER_SIZE,
    CENTER_SIZE: CENTER_SIZE,
    SIZE: SIZE,
    STACK_OFFSET: STACK_OFFSET,
    CARD_OFFSET: CARD_OFFSET,
    CARD_W: CARD_W,
    CARD_H: CARD_H,
  };
}

function startCardDrag(pid, nCards, fromLoc, fromPile) {}

function setDragPos(x, y) {}

function endCardDrag() {}

export {
  init,
  initGame,
  draw,
  getLayout,
  startCardDrag,
  setDragPos,
  endCardDrag,
  getTotalSize,
};
