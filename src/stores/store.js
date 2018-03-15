// @flow

import EventEmitter from "events";

class Store extends EventEmitter {
  constructor() {
    super();
  }

  get CHANGE(): string {
    return "CHANGE";
  }

  // Hooks a React component's callback to the CHANGED event.
  addChangeListener(callback: Function) {
    this.on(this.CHANGE, callback);
  }

  // Removes the listener from the CHANGED event.
  removeChangeListener(callback: Function) {
    this.removeListener(this.CHANGE, callback);
  }
}

module.exports = Store;
