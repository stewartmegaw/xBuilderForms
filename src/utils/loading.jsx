const React = require('react');

import Progress from 'material-ui/CircularProgress';

const Loading = React.createClass({
	render: function() {
		return (
			<div style={Object.assign({textAlign:'center',padding:'30px'},this.props.style || {})} >
				<Progress  size={this.props.size ? 60*this.props.size : 60} />
			</div>
	);}
});

module.exports = Loading;
