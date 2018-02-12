// Safest way to confirm valid date object
// Object.prototype.toString.call(date) === '[object Date]'
// https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date

const React = require("react");

import DatePicker from "material-ui/DatePicker";
import CloseSVG from "material-ui/svg-icons/navigation/close";

require("date-util");

const StdDatePickerMUI = React.createClass({
  commonDateFormat(d) {
    return d.format("ddd, mmm dS yy");
  },
  render() {
    let p = this.props;
    let fs = p.formState;

    let muiProps = Object.assign({}, p.muiProps);
    if (!muiProps.hasOwnProperty("floatingLabelText")) {
      muiProps.floatingLabelText = p.field.label;
    }
    if (!muiProps.hasOwnProperty("formatDate")) {
      muiProps.formatDate = this.commonDateFormat;
    }
    if (!muiProps.hasOwnProperty("mode")) {
      muiProps.mode = "landscape";
    }
    if (!muiProps.hasOwnProperty("minDate")) {
      // Set to today -300 years (else its mui default is today-100 years)
      let minDate = new Date();
      minDate.setHours(0, 0, 0, 0); // No time
      minDate = minDate.getTime() - 1000 * 60 * 60 * 24 * 365 * 300;
      minDate = new Date(minDate);
      muiProps.minDate = minDate;
    }

    return (
      <span style={{ position: "relative", display: "inline-block" }}>
        {/* The span wrapper is needed to place the CloseSVG button in the correct place */}
        {/* value property should be a Date object or null */}
        <DatePicker
          {...muiProps}
          {...p.stdProps}
          value={p.stdProps.value || null}
          autoOk={true}
          ref={p.name}
          onChange={(event, date) => {
            p.onChange(
              Object.prototype.toString.call(date) === "[object Date]"
                ? date.getTime()
                : null,
              event
            );
          }}
          errorText={
            fs.error_msgs[p.field.name] ? fs.error_msgs[p.field.name][0] : null
          }
          data-ignored={true}
          onFocus={p.events.onFocus}
        />
        {fs.data[p.field.name] ? (
          <CloseSVG
            style={{
              cursor: "pointer",
              position: "absolute",
              right: 10,
              bottom: 10,
              width: 20,
              height: 20
            }}
            onClick={() => {
              let s = Object.assign({}, fs);
              s.data[p.field.name] = null;
              p.updated(s);
            }}
          />
        ) : null}
      </span>
    );
  }
});

module.exports = StdDatePickerMUI;
