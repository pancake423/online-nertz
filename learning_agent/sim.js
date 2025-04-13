import { Agent } from "./agent.js";
import { Game } from "../shared/game-logic.js";
import { simMatch } from "./sim-match.js";

class Sim {
  // hyperparameters
  static N = 32; // number of individuals
  static GENERATIONS = 5; // number of generations to simulate

  static PLAYERS_PER_MATCH = 4;
  static CARDS_FLIPPED = 3;
  static N_ROUNDS = 10; // number of rounds played within each generation

  static MIN_WEIGHT = -10;
  static MAX_WEIGHT = 10;

  static NUM_RULES = 3; // number of rules to use. should be <= Agent.NUM_RULES

  static REWARD_FOR_WIN = 10; // amount of extra reward for winning a match

  static FRAC_LIVE = 0.4; // fraction of individuals that survive after each generation.

  static MUTATION_RATE = 0.25; // odds of each parameter for each individual mutating every generation
  static MUTATION_AMT = 3; // maximum delta in weight for each mutation

  static CROSSOVER_RATE = 0.1; // odds of each individual having crossover every generation
  static MIN_LEN_CROSS = 1; // length of crossover sequence
  static MAX_LEN_CROSS = 4;

  // runs the simulation and returns the full dump of results
  static run() {
    const data = [];
    let agents = this.init();
    for (let i = 0; i < this.GENERATIONS; i++) {
      const generationData = {
        agents: [],
        matches: [],
      };
      let total_wins = 0;
      console.log(`generation ${i}`);
      // simulate many rounds of matches
      for (let j = 0; j < this.N_ROUNDS; j++) {
        console.log(`round ${j}`);
        const groups = this.groupAgents(agents, this.PLAYERS_PER_MATCH);
        for (const group of groups) {
          const log = simMatch(group);
          generationData.matches.push(log);
          total_wins += log.hasWinner;
        }
      }
      console.log(
        "wins:",
        total_wins,
        "/",
        (this.N_ROUNDS * this.N) / this.PLAYERS_PER_MATCH,
      );
      // sort by performance
      const agentScore = (a) => a.score + a.wins * this.REWARD_FOR_WIN;
      agents.sort((a, b) => agentScore(b) - agentScore(a));
      // log the coefficients and scores for all agents this generation
      generationData.agents = structuredClone(agents);
      data.push(generationData);
      // apply genetic algorithm step
      const agentWeights = this.killAndReproduce(agents);
      this.mutate(agentWeights);
      this.crossover(agentWeights);

      // reset agents with their new weights
      agents = agentWeights.map((w) => new Agent(w));
    }

    return data;
  }

  // initialize a population of random agent weights
  static init() {
    const agents = [];
    for (let i = 0; i < this.N; i++) {
      agents.push(this.initAgent());
    }
    return agents;
  }

  // initialize a single random agent
  static initAgent() {
    const weights = [];
    for (let i = 0; i < this.NUM_RULES; i++) {
      weights.push(
        Math.random() * (this.MAX_WEIGHT - this.MIN_WEIGHT) + this.MIN_WEIGHT,
      );
    }
    return new Agent(weights);
  }

  // randomly split agents into groups of size n
  static groupAgents(agents, n) {
    if (this.N % n != 0)
      throw Error(`number of agents (${this.N}) is not divisible by ${n}`);

    const groups = [];
    const agentsCopy = agents.map((n) => n);
    while (agentsCopy.length > 0) {
      const group = [];
      for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * agentsCopy.length);
        group.push(agentsCopy.splice(idx, 1)[0]);
      }
      groups.push(group);
    }
    return groups;
  }

  // allows the top FRAC_LIVE percent of agents to survive and reproduce.
  // returns a list of weights instead of a list of agents.
  static killAndReproduce(agents) {
    const next = [];
    let i = 0;
    const max = Math.floor(this.N * this.FRAC_LIVE);
    while (next.length < agents.length) {
      next.push(agents[i].weights.map((n) => n));
      i = (i + 1) % max;
    }

    return next;
  }

  // applies random mutations to all the agent weights in place.
  static mutate(agentWeights) {
    for (let i = 0; i < agentWeights.length; i++) {
      for (let j = 0; j < agentWeights[i].length; j++) {
        if (Math.random() <= this.MUTATION_RATE) {
          const d = Math.random() * this.MUTATION_AMT * 2 - this.MUTATION_AMT;
          agentWeights[i][j] += d;
        }
      }
    }
  }

  // applies random crossover to all the agent weights in place
  static crossover(agentWeights) {
    for (let i = 0; i < agentWeights.length; i++) {
      if (Math.random() <= this.CROSSOVER_RATE) {
        const crossLen =
          Math.floor(
            Math.random() * (this.MAX_LEN_CROSS - this.MIN_LEN_CROSS),
          ) + this.MIN_LEN_CROSS;
        const startIdx = Math.floor(
          Math.random() * (agentWeights[i].length - crossLen),
        );
        const target = Math.floor(Math.random() * agentWeights.length);

        const mySeq = agentWeights[i].slice(startIdx, startIdx + crossLen);
        const targetSeq = agentWeights[target].slice(
          startIdx,
          startIdx + crossLen,
        );

        agentWeights[i].splice(startIdx, crossLen, ...targetSeq);
        agentWeights[target].splice(startIdx, crossLen, ...mySeq);
      }
    }
  }
}

export { Sim };
