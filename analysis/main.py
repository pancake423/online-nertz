import matplotlib.pyplot as plt
import numpy as np
import json

def load(path):
    data = {}
    with open(path, 'r') as f:
        data = json.load(f)
    return data

p2less = load("data/log-p2less.json")
p2more = load("data/log-p2more.json")
p4less = load("data/log-p4less.json")
p4more = load("data/log-p4more.json")

logs = [
    {"label": "2 players, simple ruleset", "data": p2less, "short": "2-player simple", "color": "indianred"},
    {"label": "2 players, full ruleset", "data": p2more, "short": "2-player full", "color": "orange"},
    {"label": "4 players, simple ruleset", "data": p4less, "short": "4-player simple", "color": "cornflowerblue"},
    {"label": "4 players, full ruleset", "data": p4more, "short": "4-player full", "color": "orchid"},
]

def winrate_by_generation(data):
    x = []
    y = []
    for i, generation in enumerate(data):
        wins = 0
        total = 0
        for game in generation["matches"]:
            total += 1
            if game["hasWinner"] == 1:
                wins += 1
        x.append(i+1)
        y.append(wins / total * 100)

    return [x, y]

def ppg_by_generation(data):
    x = []
    y = []
    for i, generation in enumerate(data):
        total_pts = 0
        player_games = 0
        for game in generation["matches"]:
            total_pts += sum(game["scores"])
            player_games += len(game["scores"])
        x.append(i+1)
        y.append(total_pts / player_games)
    return [x, y]

def ppg_h2h_by_generation(data):
    x = []
    y = []
    for i, generation in enumerate(data):
        player_pts = 0
        player_games = 0
        other_pts = 0
        other_games = 0
        for game in generation["h2h"]:
            player_pts += game["scores"][0]
            other_pts += sum(game["scores"][1:])
            player_games += 1
            other_games += len(game["scores"]) - 1
        x.append(i+1)
        y.append((player_pts / player_games))
    return [x, y]

def game_length_by_generation(data):
    x = []
    y = []
    for i, generation in enumerate(data):
        length = 0
        games = 0
        for game in generation["h2h"]:
            length += game["moveCount"]
            games += 1
        x.append(i+1)
        y.append(length / games)
    return [x, y]


def winrate_plot():
    for log in logs:
        plt.plot(*winrate_by_generation(log["data"]), label=log["label"], color=log["color"])

    plt.xlabel("Generation")
    plt.ylabel("Percentage of Games")
    plt.title("Games ending in Nertz by Model and Generation")
    plt.legend()
    plt.grid()
    plt.show()

def ppg_plot():
    for log in logs:
        plt.plot(*ppg_by_generation(log["data"]), label=log["label"], color=log["color"])

    plt.xlabel("Generation")
    plt.ylabel("Average Score (pts per game)")
    plt.title("PPG by Model and Generation")
    plt.legend()
    plt.grid()
    plt.show()

def ppg_h2h_plot():
    for log in logs:
        plt.plot(*ppg_h2h_by_generation(log["data"]), label=log["label"], color=log["color"])

    plt.xlabel("Generation")
    plt.ylabel("Performance (PPG against final model)")
    plt.title("Relative Performance by Model and Generation")
    plt.legend()
    plt.grid()
    plt.show()

def game_length_plot():
    for log in logs:
        plt.plot(*game_length_by_generation(log["data"]), label=log["label"], color=log["color"])

    plt.xlabel("Generation")
    plt.ylabel("Average Game Length (moves)")
    plt.title("Game Length by Model and Generation")
    plt.legend()
    plt.grid()
    plt.show()

def avg_ppg(data):
    scores = list(map(lambda n: 0, data[0]["scores"]))
    for game in data:
        for i, score in enumerate(game["scores"]):
            scores[i] += score
    return list(map(lambda n: n / len(data), scores))


def simple_vs_full_plots():
    data = load("data/simple-vs-full.json")
    p2 = avg_ppg(data["2p"])
    p4 = avg_ppg(data["4p"])

    # code modified from https://www.geeksforgeeks.org/plotting-multiple-bar-charts-using-matplotlib-in-python/
    cats = ["Simple Ruleset", "Full Ruleset"] # categories
    vals1, vals2 = [p2[1], p2[0]], [(p4[1] + p4[2] + p4[3]) / 3, p4[0]]

    # Bar width and x locations
    w, x = 0.4, np.arange(len(cats))

    fig, ax = plt.subplots()
    ax.bar(x - w/2, vals1, width=w, label='2-player', color = logs[0]["color"])
    ax.bar(x + w/2, vals2, width=w, label='4-player', color = logs[2]["color"])

    ax.set_xticks(x)
    ax.set_xticklabels(cats)
    ax.set_ylabel('Average PPG')
    ax.set_title('Head-to-Head Performance of Simple Versus Full Ruleset')
    ax.legend()
    ax.grid()

    plt.show()

def avg_runtime(data):
    t = 0
    games = 0
    for game in data[-1]["matches"]:
        t += game["time_ms"]
        games += 1
    return t / games

def runtime_plots():
    plt.title("Time to Simulate One Match by Model")
    plt.ylabel("Average Time (ms)")
    plt.bar(list(map(lambda n: n["short"], logs)), list(map(lambda n: avg_runtime(n["data"]), logs)), color=list(map(lambda n: n["color"], logs)))
    plt.grid()
    plt.show()

def plot_model_weights(log):
    weights = log["data"][-1]["bestAgent"]
    rule_names = ["play_foundation", "play_nertz", "open_work", "stack", "shuffle", "open_playable", "follow_up"]
    plt.bar(rule_names[:len(weights)], weights, color=log["color"])
    plt.grid()
    plt.title(f"Model Weights ({log['label']})")
    plt.ylabel("weight (arbitrary units)")
    plt.xticks(rotation=90, ha='center')
    plt.tight_layout()
    plt.show()


for log in logs:
    plot_model_weights(log)
runtime_plots()
simple_vs_full_plots()
winrate_plot()
ppg_plot()
ppg_h2h_plot()
game_length_plot()
