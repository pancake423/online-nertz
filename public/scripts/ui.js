import { EventHandler } from "/scripts/events.js";

EventHandler.addEventListener("joinfailed", (e) => {
  // todo: an actual interface for this at some point
  alert("Failed to join server. Double check the code you entered.");
});
EventHandler.addEventListener("joinlobby", (e) => {
  document.getElementById("lobby-code-display").value = e.id;
  showPage("lobby-menu");
});

class UI {
  static lobbyCode = undefined;
  static deckColor = "red";
  static design = "classic";
  static username = undefined;
  static {
    // set up a bunch of button click actions and events
    document.getElementById("lobby-code").oninput = (e) => {
      UI.lobbyCode = e.target.value = filterLobbyCode(e.target.value);
    };
    document.getElementById("username").oninput = (e) => {
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
}

function showPage(pageID) {
  Array(...document.getElementsByClassName("menu")).forEach((element) => {
    element.classList.add("hidden");
  });
  document.getElementById(pageID).classList.remove("hidden");
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

export { UI };
