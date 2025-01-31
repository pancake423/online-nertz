// keeps track of useful global state in one handy place.

class State {
  static MY_PID = 0; // will be dynamically determined once there is an actual server
  static game;
  static username = "pancake423";
  static nPlayers; // potentially for future use \/
  static cardPatterns;
}

export { State };
