import { Game, PILES } from "../shared/game-logic.js";

const MAX_TURNS_WO_PROGRESS = 50;

// simulate a match between the given list of agents
// returns 0 if the match ended by no progress
// returns 1 if the match ended by nertz
function simMatch(agents, nomoves = false) {
  const t_start = Date.now();
  const n = agents.length;
  const game = new Game(agents.length);
  let turn = 0;
  let turns_without_progress = 0;

  const gameLog = {
    deal: structuredClone(game.players),
    moves: [],
    hasWinner: 0,
    time_ms: 0,
  };

  let run = true;
  while (run) {
    const move = agents[turn].getMove(game, turn);
    game.makeMove(move);
    gameLog.moves.push(move);
    if (move[4] == PILES.FOUNDATION || move[4] == PILES.NERTZ) {
      turns_without_progress = 0;
    } else {
      turns_without_progress++;
    }
    if (game.checkEnd()) {
      run = false;
      gameLog.hasWinner = 1;
      agents[turn].wins++;
    }
    turn = (turn + 1) % n;
    if (turns_without_progress >= MAX_TURNS_WO_PROGRESS * n) break;
  }
  const scores = game.getScores();
  gameLog.scores = scores;
  for (let i = 0; i < n; i++) {
    agents[i].score += scores[i];
  }
  gameLog.moveCount = gameLog.moves.length;
  if (nomoves) {
    delete gameLog.moves;
    delete gameLog.deal;
  }
  const t_stop = Date.now();
  gameLog.time_ms = t_stop - t_start;
  return gameLog;
}

export { simMatch };
