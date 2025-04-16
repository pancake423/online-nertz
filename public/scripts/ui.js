import { EventHandler } from "/scripts/events.js";
import { State } from "/scripts/state.js";

EventHandler.addEventListener("joinfailed", (e) => {
  // todo: an actual interface for this at some point
  alert("Failed to join server. Causes: invalid code, lobby is full.");
});
EventHandler.addEventListener("joinlobby", (e) => {
  document.getElementById("lobby-code-display").value = e.id;
  showPage("lobby-menu");
});
EventHandler.addEventListener("start", (e) => {
  closeMenu();
});
EventHandler.addEventListener("updateplayerlist", () => {
  updatePlayerList(State.playerInfo);
  if (State.host) {
    unlockLobbyButtons();
  } else {
    lockLobbyButtons();
  }
});

class UI {
  static lobbyCode = undefined;
  static deckColor = "red";
  static design = "classic";
  static username = undefined;
  static lobbyCodeField;
  static usernameField;
  static {
    this.lobbyCodeField = document.getElementById("lobby-code");
    this.usernameField = document.getElementById("username");
    // set up a bunch of button click actions and events
    this.lobbyCodeField.oninput = (e) => {
      UI.lobbyCode = e.target.value = filterLobbyCode(e.target.value);
    };
    this.usernameField.oninput = (e) => {
      UI.username = e.target.value;
    };
    document.getElementById("pattern").oninput = (e) => {
      UI.design = e.target.value;
    };
    document.getElementById("join-button").onclick = (e) => {
      EventHandler.raiseEvent("join-start", { code: UI.lobbyCode });
    };
    document.getElementById("create-button").onclick = (e) => {
      EventHandler.raiseEvent("create-start");
    };
    document.getElementById("match-start").onclick = (e) => {
      EventHandler.raiseEvent("match-start", { code: UI.lobbyCode });
    };
    document.getElementById("add-bot").onclick = (e) => {
      EventHandler.raiseEvent("add-bot");
    };
    Array(...document.getElementsByClassName("color-select")).forEach(
      (element) => {
        element.onclick = (e) => {
          // hide all others
          const elements = e.target.parentElement.children;
          for (const el of elements) {
            el.classList.remove("active");
          }
          element.classList.add("active");
          UI.deckColor = getComputedStyle(element).backgroundColor;
        };
      },
    );
  }
  static getPrefilledValues() {
    this.username = this.usernameField.value;
    this.lobbyCode = this.lobbyCodeField.value;
  }
}

// generates the UI for one player that is currently in the lobby.
function generatePlayerUI(info) {
  const out = document.createElement("div");
  out.classList.add(
    "horiz",
    "hw",
    info.gameID == State.MY_PID ? "deco-dark" : "deco",
  );
  const pname = document.createElement("p");
  pname.innerText = info.username + (info.host ? "★" : "");

  out.appendChild(pname);

  return out;
}

function updatePlayerList(data) {
  const out = data.map((info) => generatePlayerUI(info));
  document.getElementById("player-list").replaceChildren(...out);
}

function showPage(pageID) {
  closeMenu();
  document.getElementById(pageID).classList.remove("hidden");
}

function closeMenu() {
  Array(...document.getElementsByClassName("menu")).forEach((element) => {
    element.classList.add("hidden");
  });
}

function filterLobbyCode(code) {
  const allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let out = "";
  const upper = code.toUpperCase();
  for (let i = 0; i < code.length; i++) {
    if (allowed.includes(upper[i])) {
      out += upper[i];
    }
  }
  return out;
}

function unlockLobbyButtons() {
  document.getElementById("match-start").className = "button";
  document.getElementById("add-bot").className = "button";
}

function lockLobbyButtons() {
  document.getElementById("match-start").className = "button-inactive";
  document.getElementById("add-bot").className = "button-inactive";
}

export { UI };
