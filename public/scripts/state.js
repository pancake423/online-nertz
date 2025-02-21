// keeps track of useful global state in one handy place.

class State {
  static MY_PID = 0; // will be dynamically determined once there is an actual server
  static host = false;
  static game;
  static playerInfo;
  static paused = true;
}

export { State };
