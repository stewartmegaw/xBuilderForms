const React = require('react');

var validate = require("validate.js");

var style = require('alpha-client-lib/style/file.css');

const StdFile = React.createClass({
	getInitialState:function() {
		var p = this.props;
		var previousFilenameField = null;
		var previousFilename = null;
		var showChangeLink = false;

		var removeFileFlagField = null;

		for(var i = 0; i<p.linkedFields.length; i++)
		{
			if(p.linkedFields[i].name.endsWith('PreviousFilename') && p.state.data[p.linkedFields[i].name])
			{
				previousFilenameField = p.linkedFields[i];
				showChangeLink = true;
				previousFilename = p.state.data[previousFilenameField.name];
			}

			if(p.linkedFields[i].name.endsWith('RemoveFileFlag'))
			{
				var removeFileFlagField = p.linkedFields[i];
			}
		}

		return {
			previousFilenameField: previousFilenameField,
			previousFilename: previousFilename,
			showChangeLink: showChangeLink,
			removeFileFlagField:removeFileFlagField,
		}
	},
	reset(remove) {
		this.setState({removeFile:remove});
		this.refs.fileInput.value = null;
	},
	render: function() {
		var s = this.props.state;
		var p = this.props;
        var _this = this;
        var _s = this.state;

		return (
			<div style={Object.assign({margin:'26px 0'},p.style || {})} id={p.id}>
                <p className={style.label}>
            		{p.label}

            		{_s.removeFileFlagField && _s.previousFilename ?
        				<span className={style.links} style={{color:'rgba(255,0,0,0.5)'}}>
        					&nbsp;&nbsp;
                			{_s.removeFile ?
	                			<span onClick={()=>this.reset(false)}>
									<small>Back</small>
								</span>
							:
								<span onClick={()=>this.reset(true)}>
									<small>Reset</small>
								</span>
							}
						</span>
					:null}

                	{_s.previousFilename && !_s.removeFile ?
                		<span><br/>Previously uploaded: <b>{_s.previousFilename.split('/').pop()}</b></span>
            		: null}
            	</p>

            	<div style={_s.showChangeLink && !_s.removeFile ? {overflow:'hidden',width:1,height:1}: {}}>
					<input ref="fileInput" name={p.name} type="file" onChange={(event)=>{
							if(s.error_msgs[p.name])
							{
								var copyS = Object.assign({},s);
								copyS.error_msgs[p.name] = null;
								p.updated(copyS);
							}	
						}}
					/>
				</div>

				{_s.showChangeLink && !_s.removeFile?
					<span className={[style.links,"goldLink"].join(' ')} onClick={()=>this.setState({showChangeLink:false})}>Change File</span>
				:null}

                {s.error_msgs[p.name] ?<p style={{color:'red',fontSize:12}}>{s.error_msgs[p.name]}</p> : null }
                
                {_s.previousFilenameField ? 
					<input key={_s.previousFilenameField.name} type="hidden" name={_s.previousFilenameField.name} value={_s.previousFilename} />
				:null}

				{_s.removeFile ? 
					<input key={_s.removeFileFlagField.name} type="hidden" name={_s.removeFileFlagField.name} value="1" />
				:null}
	        </div>
        )
    }
});

module.exports = StdFile;
