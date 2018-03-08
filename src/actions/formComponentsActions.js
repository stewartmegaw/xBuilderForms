import Dispatcher from "../dispatcher";

class FormComponentsActions {
  newErrors(error_msgs) {
    Dispatcher.dispatch({
      actionType: "NEW_ERRORS",
      payload: error_msgs
    });
  }

  valueChanged(data, error_msgs) {
    Dispatcher.dispatch({
      actionType: "VALUE_CHANGED",
      payload: {data, error_msgs}
    });
  }
}

export default new FormComponentsActions();
