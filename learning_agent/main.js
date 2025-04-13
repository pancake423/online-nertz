// run the simulation for 2 and 4 players, log all the raw output data
// note: expects to be run from the parent folder. otherwise, the file paths are wrong.
import { Sim } from "./sim.js";
import { Agent } from "./agent.js";
import { Game } from "../shared/game-logic.js";
import { simMatch } from "./sim-match.js";
import fs from "fs";

function avgWeights(w) {
  return w[0].map((_, i) => w.reduce((acc, v) => acc + v[i], 0) / w.length);
}

const res = Sim.run();
fs.writeFileSync("data/log.json", JSON.stringify(res), "utf8"); // roughly 10mb for a full run
