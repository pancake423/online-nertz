class EventHandler {
  static defaultEvents = [
    "mousemove",
    "mouseup",
    "mousedown",
    "keyup",
    "keydown",
    "blur",
  ];
  constructor() {
    this.events = {};
    // default events: mousemove, mouseup, mousedown, keyup, keydown
    for (const event of EventHandler.defaultEvents) {
      window.addEventListener(event, (e) => {
        this.raiseEvent(event, e, true);
      });
    }
  }

  addEventListener(eventName, func) {
    if (!(eventName in this.events)) this.events[eventName] = [];
    this.events[eventName].push(func);
  }

  raiseEvent(eventName, data, supress = false) {
    if (!(eventName in this.events)) {
      if (!supress)
        console.warn(
          `EventHandler warning: event '${eventName}' was raised but has no listeners.`,
        );
      return;
    }
    for (const func of this.events[eventName]) {
      func(data);
    }
  }
}

export { EventHandler };
