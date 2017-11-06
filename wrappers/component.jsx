const React = require('react');
/*
Some nice info on the difference between layoutExtended & layoutWrapper
https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e#.t3r6zwj02
*/

var validate = require("validate.js");

/*
HOC Type 1: Props Proxy
Use this to:
1) Wrap the child in components
2) Manipulate the props
3) Abstract the state
*/
const HOC_Component2 = function(WrappedComponent) {
	var Wrapped = class extends React.Component {
		constructor(props) {
			super(props);
		}
		render() {
			return (
				<WrappedComponent {...this.props} />
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
const HOC_Component = function(cp) {
	return HOC_Component2(class extends cp {
		getInitialState(){
            return super.getInitialState ? super.getInitialState() : {};
      	}

      	// Generic field validation onChange
      	onChange(value){
      		if(super.onChange)
      		{
      			super.onChange(value);
      			return;
      		}

			var p = this.props;
			var s = p.state;

		  	var _s = Object.assign({},s);
		  	_s.data[p.name] = value;

		  	// There is currently an error so validate onChange
		  	if(s.error_msgs[p.name])
	  		{
	  			// Only validate this field
	  			var fieldVals = {};
				fieldVals[p.name] = value;
				var constraints = {};
				constraints[p.name] = s.constraints[p.name];
				var errors = validate(fieldVals, constraints);
		  		_s.error_msgs = errors || {};
	  		}

	  		if(p.updateNeighbours)
	  			_s = this.updateNeighbours(value, _s);

		  	p.updated(_s);
		}

		// Legacy code from weestay. Probably still works
		// and will be useful in future
		updateNeighbours(value, _s){
			if(super.updateNeighbours)
      		{
      			super.updateNeighbours(value);
      			return;
      		}

      		var p = this.props;

      		for(var i =0; i<p.updateNeighbours.length; i++)
  			{
  				var updateNeighbour = p.updateNeighbours[i];

	  			if(updateNeighbour.value == "value")
	  			{
		  			if(updateNeighbour.condition)
		  			{
		  				var conditionMet = false;
		  				if(updateNeighbour.condition == "greaterOrEqual" && value >= _s.data[updateNeighbour.field])
		  				{	
		  					conditionMet = true;
					  		_s.data[updateNeighbour.field] = _s.data[p.name];
					  		if(updateNeighbour.add)
					  			_s.data[updateNeighbour.field] += (updateNeighbour.add * 1000 * 60 * 60 * 24) 
		  				}
		  				else if(updateNeighbour.condition == "lessOrEqual" && value <= _s.data[updateNeighbour.field])
		  				{	
		  					conditionMet = true;
					  		_s.data[updateNeighbour.field] = _s.data[p.name];
					  		if(updateNeighbour.subtract)
					  			_s.data[updateNeighbour.field] -= (updateNeighbour.subtract * 1000 * 60 * 60 * 24) 
		  				}

		  				if(conditionMet)
							if(updateNeighbour.msg)
								emitter.emit(
									'info_msg', 
									updateNeighbour.msg
							 	);	  					
		  			}
		  			else
		  			{
		  				if(updateNeighbour.type == 'onFocusSetDate')
		  				{
		  					for(var j =0; j <_s.fields.length; j++)
		  					{
			  					if(_s.fields[j].name == updateNeighbour.field)
			  					{
			  						_s.fields[j].options = Object.assign(_s.fields[j].options || {}, {'onFocusSetDate':_s.data[p.name]});
			  						break;
			  					}
		  					}
		  				}
		  			}
	  			}
  			}

  			return _s;

		}

		componentDidMount() {
			if(super.componentDidMount)
				super.componentDidMount();
		}


		render() {
			return super.render();
		}
	})
}

module.exports = HOC_Component;