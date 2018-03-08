import { EventEmitter } from "events";

class Store extends EventEmitter {
  constructor() {
    super();
  }

  get CHANGE() {
    return "CHANGE";
  }

  // Hooks a React component's callback to the CHANGED event.
  addChangeListener(callback) {
    this.on(this.CHANGE, callback);
  }

  // Removes the listener from the CHANGED event.
  removeChangeListener(callback) {
    this.removeListener(this.CHANGE, callback);
  }
}

module.exports = Store;
