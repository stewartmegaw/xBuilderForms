const React = require("react");
import formComponentsActions from "../../actions/formComponentsActions";
import formComponentsStore from "../../stores/formComponentsStore";
/*
Some nice info on the difference between layoutExtended & layoutWrapper
https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e#.t3r6zwj02
*/

let validate = require("validate.js");

/*
HOC Type 1: Props Proxy
Use this to:
1) Wrap the child in components
2) Manipulate the props
3) Abstract the state
*/
export default function(WrappedComponent) {
  let Wrapped = class extends React.Component {
    constructor(props) {
      super(props);
      this.onChange = this.onChange.bind(this);
      this.onFormComponentsStoreUpdated = this.onFormComponentsStoreUpdated.bind(this);
      this.state = {value:"", error_msgs: null};
    }

    componentWillMount() {
      formComponentsStore.addChangeListener(this.onFormComponentsStoreUpdated);
    }

    componentWillUnmount() {
      formComponentsStore.removeChangeListener(this.onFormComponentsStoreUpdated);
    }

    onFormComponentsStoreUpdated() {
      // Set the data and error_msgs
      let store = formComponentsStore.getStore();
      let fieldName = this.props.field.name;
      this.setState({value: store.data[fieldName], error_msgs: store.error_msgs[fieldName]});
    }


    // Generic field validation onChange
    onChange(value, event) {
      // OLD code for checking onChange override
      // if (super.onChange) {
      //   super.onChange(value, () => {
      //     if (p.events && p.events.onChangeFinished)
      //       p.events.onChangeFinished(value);
      //   });
      //   return;
      // }
      
      let store = formComponentsStore.getStore();
      let fieldName = this.props.field.name;
      let data = Object.assign({}, store.data);
      data[fieldName] = value;

      // let p = this.props;
      // let s = p.formState || p.state;

      // let _s = Object.assign({}, s);
      // _s.data[p.field.name] = value;

      // If there is currently an error validate onChange
      let all_error_msgs = Object.assign({}, store.error_msgs);
      if (all_error_msgs[fieldName]) {
        // Some validations rely on other fields values so we must pass
        // in all other field values
        let form = document.querySelector("form#" + "form_" + this.props.form.name);
        let formValues = validate.collectFormValues(form, { trim: true });
        let errors = validate(formValues, this.props.form.constraints);
        // Update errors but only for this field
        if (errors) all_error_msgs = errors;
        else delete all_error_msgs[fieldName];
      }

      // if(p.updateNeighbours)
      //  _s = this.updateNeighbours(value, _s);

      formComponentsActions.valueChanged(data, all_error_msgs);
      // p.updated(_s, () => {
      if (this.props.events && this.props.events.onChangeFinished)
        this.props.events.onChangeFinished(value, event);

      // Global
      if (this.props.onChangeFinished) {
        this.props.onChangeFinished(event);
      }
      // });s
    }

    render() {
      let p = this.props;

      // Check for linked fields
      let linkedFields = [];
      // TODO Remove p.state after upgrade
      this.props.form.fields.map(function(_field) {
        if (_field.options && _field.options.linkedTo == p.field.name)
          linkedFields.push(_field);
      });

      let commonProps = {
        id: p.form.name + p.field.name,
        name: p.field.name,
        linkedFields: linkedFields,
        value: this.state.value,
        error_msgs: this.state.error_msgs
      };

      /* TODO: setChild needs updated */
      return (
        <WrappedComponent
          {...p}
          {...commonProps}
          setChild={child => (this.child = child)}
          onChange={this.onChange}
        />
      );
    }
  };

  return Wrapped;
}

/*
HOC Type 2: Inheritance Inversion
Use this to:
1) Override methods of the child
2) Render hijacking
3) Set state
*/
// const HOC_Component = function(cp) {
//   return HOC_Component2(
//     class extends cp {
//       getInitialState() {
//         let ss = super.getInitialState ? super.getInitialState() : {};
//         // return Object.assign(ss, {
//         //   options: this.props.field.options
//         // });
//         return ss;
//       }

//       // Generic field validation onChange
//       onChange(value, event) {
//         if (super.onChange) {
//           super.onChange(value, () => {
//             if (p.events && p.events.onChangeFinished)
//               p.events.onChangeFinished(value);
//           });
//           return;
//         }

//         let p = this.props;
//         let s = p.formState || p.state;

//         let _s = Object.assign({}, s);
//         _s.data[p.name] = value;

//         // There is currently an error so validate onChange
//         if (s.error_msgs[p.name]) {
//           // Some validations rely on other fields values so we must pass
//           // in all other field values
//           let form = document.querySelector("form#" + "form_" + p.formName);
//           let formValues = validate.collectFormValues(form, { trim: true });
//           let errors = validate(formValues, s.constraints);
//           // Update errors but only for this field
//           if (errors) _s.error_msgs = errors;
//           else delete _s.error_msgs[p.name];
//         }

//         // if(p.updateNeighbours)
//         //  _s = this.updateNeighbours(value, _s);

//         p.updated(_s, () => {
//           if (p.events && p.events.onChangeFinished)
//             p.events.onChangeFinished(value, event);

//           // Global
//           if (p.onChangeFinished) p.onChangeFinished(event);
//         });
//       }

//       // Legacy code from weestay. Probably still works
//       // and will be useful in future
//       // updateNeighbours(value, _s){
//       //  if(super.updateNeighbours)
//       //        {
//       //          super.updateNeighbours(value);
//       //          return;
//       //        }

//       //        let p = this.props;

//       //        for(let i =0; i<p.updateNeighbours.length; i++)
//       //      {
//       //        let updateNeighbour = p.updateNeighbours[i];

//       //        if(updateNeighbour.value == "value")
//       //        {
//       //        if(updateNeighbour.condition)
//       //        {
//       //          let conditionMet = false;
//       //          if(updateNeighbour.condition == "greaterOrEqual" && value >= _s.data[updateNeighbour.field])
//       //          {
//       //            conditionMet = true;
//       //            _s.data[updateNeighbour.field] = _s.data[p.name];
//       //            if(updateNeighbour.add)
//       //              _s.data[updateNeighbour.field] += (updateNeighbour.add * 1000 * 60 * 60 * 24)
//       //          }
//       //          else if(updateNeighbour.condition == "lessOrEqual" && value <= _s.data[updateNeighbour.field])
//       //          {
//       //            conditionMet = true;
//       //            _s.data[updateNeighbour.field] = _s.data[p.name];
//       //            if(updateNeighbour.subtract)
//       //              _s.data[updateNeighbour.field] -= (updateNeighbour.subtract * 1000 * 60 * 60 * 24)
//       //          }

//       //          if(conditionMet)
//       //          if(updateNeighbour.msg)
//       //            emitter.emit(
//       //              'info_msg',
//       //              updateNeighbour.msg
//       //            );
//       //        }
//       //        else
//       //        {
//       //          if(updateNeighbour.type == 'onFocusSetDate')
//       //          {
//       //            for(let j =0; j <_s.fields.length; j++)
//       //            {
//       //              if(_s.fields[j].name == updateNeighbour.field)
//       //              {
//       //                _s.fields[j].options = Object.assign(_s.fields[j].options || {}, {'onFocusSetDate':_s.data[p.name]});
//       //                break;
//       //              }
//       //            }
//       //          }
//       //        }
//       //        }
//       //      }

//       //      return _s;

//       // }

//       componentDidMount() {
//         // Setup the child component so methods
//         // in the child can be reached
//         this.props.setChild(this);

//         if (super.componentDidMount) super.componentDidMount();
//       }

//       render() {
//         return super.render();
//       }
//     }
//   );
// };

// export default HOC_Component;
