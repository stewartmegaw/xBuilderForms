const React = require('react');

import DatePicker from 'material-ui/DatePicker';
import CloseSVG from 'material-ui/svg-icons/navigation/close';

var Component = require('xbuilder-forms/wrappers/component');
var validate = require("validate.js");

require('date-util');

const StdDatePicker = Component(React.createClass({
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
		          onChange={(e,date)=>this.onChange(date.getTime())}
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
}));

module.exports = StdDatePicker;