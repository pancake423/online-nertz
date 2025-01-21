import * as glr from "/scripts/gl-draw.js";
import * as ss from "/scripts/spritesheet.js";
import { CARD_W, CARD_H } from "/scripts/card-renderer.js";

// scaling factor on canvases for performance reasons.
// higher number = more scaling = lower res
let RENDER_SCALE = 1;
// z depth at which object should be rendered. determined by nr of players in the game.
let DEPTH = 0;
// dimensions of the grid where foundation piles are rendered.
let FOUNDATION_DIMS = [0, 0];
let PLAYER_OFFSET = 0;
let GAME_SIZE = 0;

const PADDING = 0.5; //unit is card height. Gap between separate blocks of cards
const STACK_OFFSET = 0.1; // gap between cards that are associated together
const CARD_THICKNESS = 0.01; // in z units
const PILE_OFFSET = 0.004;

const ANIM_SCALE_FACTOR = 1.25; // how much larger should cards look when picked up by one unit

const BG_COLOR = "#2E7D32";
const BG_ACCENT_COLOR = "#1B5E20";

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

  FOUNDATION_DIMS = [4, nPlayers];
  const centerSize = Math.max(
    FOUNDATION_DIMS[0] * (1 + STACK_OFFSET),
    FOUNDATION_DIMS[1] * (1 + STACK_OFFSET),
  );
  PLAYER_OFFSET = Math.min(1 + STACK_OFFSET * 13, 2 + STACK_OFFSET) + PADDING;
  const size = centerSize + 2 * PLAYER_OFFSET + PADDING * 2;

  const d = ANIM_SCALE_FACTOR / (ANIM_SCALE_FACTOR - 1);
  const theta = 2 * Math.atan(size / (2 * d));
  GAME_SIZE = size;
  DEPTH = d;
  glr.setCamera(theta, d * 2);
}

function initGame(cardInfo) {
  initDrawSpace(cardInfo);

  const spriteSheets = ss.makeSpriteSheets(cardInfo);
  glr.loadTextures(spriteSheets, ss.SHEET_DIMENSIONS);
}

function drawPile(x, y, cards, rot) {
  if (cards.length == 0) {
    glr.drawCard([x, y, DEPTH], rot, ss.getEmptyLoc(), ss.getEmptyLoc());
  }
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    glr.drawCard(
      [x + PILE_OFFSET * i, y + PILE_OFFSET * i, DEPTH - CARD_THICKNESS * i],
      rot,
      ss.getFaceLoc(card[0], card[1]),
      ss.getBackLoc(card[2]),
    );
  }
}

function draw(game, myPID) {
  drawBackground();
  glr.clear();

  // draw the foundation piles in the center
  let x = (FOUNDATION_DIMS[0] + STACK_OFFSET * (FOUNDATION_DIMS[0] - 1)) / -2;
  let y = (FOUNDATION_DIMS[1] + STACK_OFFSET * (FOUNDATION_DIMS[1] - 1)) / -2;
  for (let i = 0; i < game.foundations.length; i++) {
    const dx = i % FOUNDATION_DIMS[0];
    const dy = Math.floor(i / FOUNDATION_DIMS[0]);

    drawPile(
      x + dx * (1 + STACK_OFFSET) + 0.5,
      y + dy * (1 + STACK_OFFSET) + 0.5,
      game.foundations[i],
      [0, 0, 0],
    );
  }

  // draw the player hands
  const player = game.players[0];
  const nPiles = player.workPiles.length + 1;
  const sx = -nPiles / 2;
  for (let i = 0; i < player.workPiles.length; i++) {
    drawPile(sx + i + 0.5, PLAYER_OFFSET + 0.5, player.workPiles[i], [0, 0, 0]);
  }
  drawPile(sx + nPiles - 0.5, PLAYER_OFFSET + 0.5, player.nertzPile, [0, 0, 0]);
}

function drawBackground() {
  const ctx = bgctx;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
}

export { init, initGame, draw };
