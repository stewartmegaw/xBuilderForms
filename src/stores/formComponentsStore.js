import Store from "./store";
import Dispatcher from "../dispatcher";

let error_msgs = {};
let data = {};

class FormComponentsStore extends Store {
  constructor() {
    super();

    Dispatcher.register(this.registerActions.bind(this));
  }

  registerActions(action) {
    switch (action.actionType) {
      case "NEW_ERRORS":
        error_msgs = action.payload || {};
        this.emit(this.CHANGE);
        break;
      case "VALUE_CHANGED":
        data = action.payload.data || {};
        error_msgs = action.payload.error_msgs || {};
        this.emit(this.CHANGE);
        break;
      default:
        break;
    }
  }

  // Returns the current store's state.
  getStore() {
    return {
      data,
      error_msgs
    };
  }
}

export default new FormComponentsStore();
