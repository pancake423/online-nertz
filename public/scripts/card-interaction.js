import { PILES } from "/shared/game-logic.js";

let LAYOUT;
let PILE_SELECTED = false;
let C;
let getTotalSize; // function
let EH;

const PILE_LENIENCY = 0.007; // compensates for visual effect of stacked cards; makes piles clickable everywhere.

function init(renderer, eventHandler) {
  LAYOUT = renderer.getLayout();
  getTotalSize = renderer.getTotalSize;
  EH = eventHandler;
  C = document.getElementById("c");
}

function globalToGameCoords(x, y) {
  // first convert global coords to canvas coords
  const cx = x - (window.innerWidth - C.width) / 2;
  const cy = y - (window.innerHeight - C.height) / 2;

  // then convert canvas coords to game coords
  // uses the fact that the canvas is always square
  return [cx, cy].map((coord) => (coord / C.width) * LAYOUT.SIZE);
}

// given an x, y in game coords,
// get the card pile, if any, that is at that point.
function getSelectedCard(game, pid, x, y) {
  const nCards = game.players[0].workPiles.length + 1;
  const w = LAYOUT.CARD_W / LAYOUT.CARD_H;
  const h = 1;
  const wGap = w + LAYOUT.STACK_OFFSET;
  const hGap = h + LAYOUT.STACK_OFFSET;

  let cx = (LAYOUT.SIZE - getTotalSize(nCards, true)) / 2;
  let cy = LAYOUT.SIZE - LAYOUT.PLAYER_SIZE;

  // array of [x steps, y steps, outLoc, outPile]
  // nertz, stock, and waste piles
  const locations = [
    [(nCards - 1) * wGap + cx, cy, PILES.NERTZ, 0],
    [(nCards - 1) * wGap + cx, cy + hGap, PILES.STOCK, 0],
    [nCards * wGap + cx, cy + hGap, PILES.WASTE, 0],
  ];
  // work piles
  for (let i = 0; i < nCards - 1; i++) {
    locations.push([i * wGap + cx, cy, PILES.WORK, i]);
  }
  // foundation piles
  const nPlayers = game.players.length;
  cx = (LAYOUT.SIZE - getTotalSize(nPlayers, true)) / 2;
  cy = (LAYOUT.SIZE - getTotalSize(4)) / 2;
  for (let i = 0; i < game.foundations.length; i++) {
    locations.push([
      cx + (i % 4) * wGap,
      cy + Math.floor(i / 4) * hGap,
      PILES.FOUNDATION,
      i,
    ]);
  }

  for (const l of locations) {
    const [sx, sy, loc, pile] = l;
    const pileSize = game.getPileContents(pid, loc, pile).length;
    let xCushion = 0;
    let yCushion = 0;
    if (loc == PILES.WORK) {
      yCushion = pileSize * LAYOUT.CARD_OFFSET;
    } else if (loc != PILES.FOUNDATION) {
      xCushion = PILE_LENIENCY * pileSize;
      yCushion = PILE_LENIENCY * pileSize;
    }
    if (checkCollide(x, y, sx, sy, w + xCushion, h + yCushion)) {
      let nCards = 1;
      if (loc == PILES.WORK) {
        let bottomH = sy + yCushion;
        for (let i = 0; i < pileSize; i++) {
          bottomH -= LAYOUT.CARD_OFFSET;
          if (y <= bottomH) nCards++;
        }
      }
      return [loc, pile, nCards];
    }
  }

  return [PILES.INVALID, -1, -1];
}

function checkCollide(x, y, sx, sy, w, h) {
  return x >= sx && x <= sx + w && y >= sy && y <= sy + h;
}

function onMouseDown(game, pid, e) {
  const [x, y] = globalToGameCoords(e.clientX, e.clientY);
  const [loc, pile, nCards] = getSelectedCard(game, pid, x, y);
  if (loc == PILES.INVALID || loc == PILES.FOUNDATION) return;
  PILE_SELECTED = true;
  EH.raiseEvent("selectpile", {
    pid: pid,
    loc: loc,
    pile: pile,
    x: x,
    y: y,
    nCards: nCards,
  });
}

function onMouseUp(game, pid, e) {
  if (!PILE_SELECTED) return;
  PILE_SELECTED = false;
  const [x, y] = globalToGameCoords(e.clientX, e.clientY);
  const [loc, pile, nCards] = getSelectedCard(game, pid, x, y);
  EH.raiseEvent("releasepile", { pid: pid, loc: loc, pile: pile, x: x, y: y });
}

function onMouseMove(pid, e) {
  if (!PILE_SELECTED) return;
  const [x, y] = globalToGameCoords(e.clientX, e.clientY);
  EH.raiseEvent("movepile", { pid: pid, x: x, y: y });
}

function onBlur(pid, e) {
  if (!PILE_SELECTED) return;
  PILE_SELECTED = false;
  EH.raiseEvent("releasepile", { pid: pid, loc: PILES.INVALID, pile: -1 });
}

export { init, onMouseUp, onMouseDown, onMouseMove, onBlur };
