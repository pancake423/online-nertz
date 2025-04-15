// run the simulation for 2 and 4 players, log all the raw output data
// note: expects to be run from the parent folder. otherwise, the file paths are wrong.
import { Sim } from "./sim.js";
import { Agent } from "./agent.js";
import { Game } from "../shared/game-logic.js";
import { simMatch } from "./sim-match.js";
import fs from "fs";

const AVG_AGENT_POOL = Sim.N;
const NUM_H2H = 10;
let MODEL_NAME = "log.json";

function avgWeights(w) {
  return w[0].map((_, i) => w.reduce((acc, v) => acc + v[i], 0) / w.length);
}

// run four agents: 2-player/4-player and less/more rules
// create logs of all the data
// create "average agents" from each generation's top 5 (or 10 or something)
// run a bunch of sim matches to get "ppg against final agent"
// store the average agent over time data as well

// config for 2 players, less rules
function p2less() {
  Sim.PLAYERS_PER_MATCH = 2;
  Sim.NUM_RULES = 4;
  MODEL_NAME = "p2less";
  console.log("simulating 2 players, less rules:");
}

// config for 2 players, more rules
function p2more() {
  Sim.PLAYERS_PER_MATCH = 2;
  Sim.NUM_RULES = 7;
  MODEL_NAME = "p2more";
  console.log("simulating 2 players, more rules:");
}

// config for 4 players, less rules
function p4less() {
  Sim.PLAYERS_PER_MATCH = 4;
  Sim.NUM_RULES = 4;
  MODEL_NAME = "p4less";
  console.log("simulating 4 players, less rules:");
}

// config for 4 players, more rules
function p4more() {
  Sim.PLAYERS_PER_MATCH = 4;
  Sim.NUM_RULES = 7;
  MODEL_NAME = "p4more";
  console.log("simulating 4 players, more rules:");
}

function runSims() {
  const rules = [p2less, p2more, p4less, p4more];
  const data = [];
  for (const ruleset of rules) {
    ruleset();
    const res = Sim.run();
    for (const gen of res) {
      gen.bestAgent = avgWeights(
        gen.agents.slice(0, AVG_AGENT_POOL).map((n) => n.weights),
      );
    }
    for (const gen of res) {
      // pit this generation's best agent against the final model's best agent.
      gen.h2h = [];
      const agents = [new Agent(gen.bestAgent)];
      while (agents.length < gen.matches[0].scores.length) {
        agents.push(new Agent(res[res.length - 1].bestAgent));
      }
      for (let i = 0; i < NUM_H2H; i++) {
        gen.h2h.push(simMatch(agents, true)); // no move logs
      }
    }
    fs.writeFileSync(
      `data/log-${MODEL_NAME}.json`,
      JSON.stringify(res),
      "utf8",
    );
    data.push(res);
  }

  // make the best simple rules agent play against the best full rules agent
  const matches2 = [];
  const matches4 = [];
  const agents2 = [
    new Agent(data[1][data[1].length - 1].bestAgent),
    new Agent(data[0][data[0].length - 1].bestAgent),
  ];
  const agents4 = [
    new Agent(data[3][data[3].length - 1].bestAgent),
    new Agent(data[2][data[2].length - 1].bestAgent),
    new Agent(data[2][data[2].length - 1].bestAgent),
    new Agent(data[2][data[2].length - 1].bestAgent),
  ];
  for (let i = 0; i < NUM_H2H * 10; i++) {
    matches2.push(simMatch(agents2, true));
    matches4.push(simMatch(agents4, true));
  }
  fs.writeFileSync(
    `data/simple-vs-full.json`,
    JSON.stringify({ "2p": matches2, "4p": matches4 }),
    "utf8",
  );
}

runSims();
