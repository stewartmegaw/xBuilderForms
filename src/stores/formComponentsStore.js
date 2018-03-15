// @flow

import Store from "./store";
import Dispatcher from "../dispatcher";

type Error_Msgs = { [ string ] : Array<string> } | {};

let error_msgs: Error_Msgs = {};
let data = {};

class FormComponentsStore extends Store {
  constructor() {
    super();

    Dispatcher.register(this.registerActions.bind(this));
  }

  registerActions(action: {actionType: string, payload: {data?: any, error_msgs: Error_Msgs}}) {
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
  getStore(): {data: Object, error_msgs: Error_Msgs} {
    return {
      data,
      error_msgs
    };
  }
}

export default new FormComponentsStore();
