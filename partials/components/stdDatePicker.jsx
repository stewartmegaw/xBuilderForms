const React = require('react');

import DatePicker from 'material-ui/DatePicker';
import CloseSVG from 'material-ui/svg-icons/navigation/close';

var validate = require("validate.js");

require('date-util');

const StdDatePicker = React.createClass({
	onChange:function(date, field){
		var s = this.props.state;

	  	var _s = Object.assign({},s);
	  	_s.data[field] = date.getTime();

	  	// There is currently an error so validate onChange
	  	if(s.error_msgs[field]) 
  		{
  			// Only validate this field
  			var fieldVals = {};
			fieldVals[field] = date.getTime();
			var constraints = {};
			constraints[field] = s.constraints[field];
			var errors = validate(fieldVals, constraints);
			var _s = Object.assign({},s);
	  		_s.error_msgs = errors || {};
  		}

  		var updateNeighbours = this.props.updateNeighbours;
  		if(updateNeighbours)
  		{
  			for(var i =0; i<updateNeighbours.length; i++)
  			{
  				var updateNeighbour = updateNeighbours[i];

	  			if(updateNeighbour.value == "value")
	  			{
		  			if(updateNeighbour.condition)
		  			{
		  				var conditionMet = false;
		  				if(updateNeighbour.condition == "greaterOrEqual" && date >= new Date(_s.data[updateNeighbour.field]))
		  				{	
		  					conditionMet = true;
					  		_s.data[updateNeighbour.field] = _s.data[field];
					  		if(updateNeighbour.add)
					  			_s.data[updateNeighbour.field] += (updateNeighbour.add * 1000 * 60 * 60 * 24) 
		  				}
		  				else if(updateNeighbour.condition == "lessOrEqual" && date <= new Date(_s.data[updateNeighbour.field]))
		  				{	
		  					conditionMet = true;
					  		_s.data[updateNeighbour.field] = _s.data[field];
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
			  						_s.fields[j].options = Object.assign(_s.fields[j].options || {}, {'onFocusSetDate':_s.data[field]});
			  						break;
			  					}
		  					}
		  				}
		  			}
	  			}
  			}
  		}

	  	this.props.updated(_s);
	},
    commonDateFormat: function(d){
        return d.format('ddd, mmm dS yy')
    },
    getLocalTime:function(time){
    	var d = new Date(Number(time))
    	var _userOffset = d.getTimezoneOffset()*60000;
    	return d.getTime()-_userOffset;
    },
	render: function() {
		var s = this.props.state;
		var p = this.props;

		var mui_props = {
			name: "dummy"+p.name,
			id:p.id,
			mode:p.mode || 'landscape',
			formatDate:p.formatDate || this.commonDateFormat,
			style:{display:'inline-block'},
			minDate:p.minDate,
			floatingLabelText:p.floatingLabelText || "Date"
		};

		return (
			<div style={Object.assign({display:'inline-block'}, p.style || {})} >
				<DatePicker
				  {...mui_props}
				  autoOk={true}
		          ref={p.name}
		          value={!s.data[p.name] ? null : new Date(this.getLocalTime(s.data[p.name]))}
		          onChange={(e,date)=>this.onChange(date, p.name)}
		          errorText={s.error_msgs[p.name] ? s.error_msgs[p.name][0] : null}
				  data-ignored={true}
				  onFocus={p.onFocusSetDate ? () => {
				  	if(!s.data[p.name])
				  	{
					  	var _s = Object.assign({},s);
		  				_s.data[p.name] = p.onFocusSetDate;
		  				p.updated(_s);
				  	}
				  }: null}
		        />
		        {s.data[p.name] ?
			       	 <CloseSVG
						style={{cursor:'pointer',position:'relative',left:-30,top:4,width:20,height:20}}
						onClick={()=>{
							var _s = Object.assign({},s);
			  				_s.data[p.name] = null;
			  				p.updated(_s);
						}}
					/>
				:null}
		        <input type="hidden" name={p.name} value={this.getLocalTime(s.data[p.name])} />
	        </div>
				  
	);}
});

module.exports = StdDatePicker;