const React = require('react');

import 'whatwg-fetch';

import Chip from 'material-ui/Chip';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';

import SearchSVG from 'material-ui/svg-icons/action/search';
import AddSVG from 'material-ui/svg-icons/content/add';

const tagsStyle = require('../../style/tags.css');

const Loading = require('xbuilder-core/helpers/loading');

const StdTagSuggest = React.createClass({
	getInitialState:function() {
		return {
			displayTags:this.props.displayTags|| [],
			tagInputTxt:'',
			tagsSelected:[],
			tagTextField:this.props.tagTextField || 'name',
			tagSuggestions:[]
		};
	},
	componentDidMount(){
		this.init();
	},
	componentWillReceiveProps(nextProps){
		if(this.props.viewMode != nextProps.viewMode)
		{
			this.setState({displayTags: this.props.displayTags|| [], tagsSelected:[]}, this.init);
		}
	},
	init(){
		// Check if initial tags needs to be added
		var p = this.props;
		var s = this.state;
		if(p.state && p.state.data && p.state.data[p.name])
		{
			var values = [];
			for(var i=0;i< p.state.data[p.name].length; i++)
			{
				var item = p.state.data[p.name][i];
				if(typeof item === 'object')
					values.push(item[s.tagTextField]);
				else
					values.push(item);
			}
			this.tagSelectedUpdateState(values);
		}
		// If there are display tags create empty entries in tagsSelected[]
		// Assume any form action is handled properly by the parent component
		else
		{
			if(s.displayTags.length > 0)
			{
				var _tagsSelected = [];
				for(var i = 0; i<s.displayTags.length; i++)
					_tagsSelected.push({});
				this.setState({tagsSelected:_tagsSelected});
			}
		}
	},
	getTag4AS:function(name){
		return (<MenuItem style={{minHeight:40,paddingTop:4}}><Chip style={{pointerEvents:'none'}}>{name}</Chip></MenuItem>);
	},
	getTagTimer:null,
	clear:function(){
		this.setState({tagInputTxt:'',tagSuggestions:[]});
	},
	focus:function(){
		if(!this.props.viewMode)
			this.refs.autocomplete.focus();
	},
	tagTextChanged:function(v){
		var _this = this;
		
		if(this.getTagTimer)
		{
			window.clearTimeout(this.getTagTimer);
			this.getTagTimer = null;		
		}

		this.getTagTimer = window.setTimeout(function(){
			var requestId = Date.now();
			_this.setState({requestId:requestId}, function(){
				var val = v.trim().toLowerCase();
				fetch('/tags/suggest?name='+val+'&requestId='+requestId,{
		            headers: {
		                'X-Requested-With': 'XMLHttpRequest'
		            },
		          method:'GET',
		          credentials: 'include',
				}).then(function(response) {
					if(response.ok)
						return response.json();
					else
						throw new Error('Network response error');
				}).then(function(r) {
					console.log(r);
					var tagSuggestions = [];
	            	var valFound = false;
	            	for(var i = 0; i < r.results.length; i++)
	            	{	
	            		var tag = r.results[i];
	            		
	            		if(tag[_this.state.tagTextField] == val)
	            			valFound = true;

	            		if(!_this.props.unique || _this.indexOfTag(_this.state.tagsSelected, tag[_this.state.tagTextField]) ==-1)
	            		{
		            		tagSuggestions.push({
		            			text:tag[_this.state.tagTextField],
			            		value:_this.getTag4AS(tag[_this.state.tagTextField])
		            		});
	            		}
	            	}

	            	if(!valFound && _this.props.inputAsTag)
	            		if(!_this.props.unique || _this.indexOfTag(_this.state.tagsSelected, val) ==-1)
	            		{
		            		tagSuggestions.unshift({
		            			text:val,
			            		value:val
		            		});
		            	}

	            	_this.setState({tagSuggestions:tagSuggestions, requestId:requestId == r.requestId ? null : _this.state.requestId});
				}).catch(function(err) {
					console.log(err);
				});
			});
	    }, 400);
	},
	indexOfTag(tagArray, tagValue){
		for(var i = 0; i < tagArray.length; i++)
		{
			if(tagArray[i][this.state.tagTextField] === tagValue)
				return i;
		}

		return -1;
	},
	updateDisplayTags(name){
		var _this = this;
		var displayTags = this.state.displayTags.slice(0);
     	displayTags.push(<Chip
     		key={"diplayTag"+name}
     		onRequestDelete={_this.props.viewMode ? null : ()=>{
     			var _displayTags = _this.state.displayTags.slice(0);
     			var idx = -1;
     			for(var i =0; i<_displayTags.length; i++){
     				if(_displayTags[i].key=="diplayTag"+name)
     				{
     					idx = i;
     					break;
     				}
     			}
     			if(idx >= 0)
     			{	
	     			_displayTags.splice(idx, 1);
	     			var _tagsSelected = _this.state.tagsSelected.slice(0);
	     			_tagsSelected.splice(idx, 1);
	     			_this.setState({displayTags:_displayTags, tagsSelected:_tagsSelected});
     			}
     		}}
            className={tagsStyle.tags}
            style={{float:'left'}}>{name}</Chip>
        );
    	this.setState({displayTags:displayTags});
		_this.clear();
		_this.focus();
	},
	tagSelectedUpdateState(values){
		var _this = this;
		values = [].concat(values) // Force values to an array if not already

		var value = values[0];
		var _tagsSelected = this.state.tagsSelected.slice(0);
		var newTagSelected = {};
		newTagSelected[this.state.tagTextField] = value;
		_tagsSelected.push(newTagSelected);

		// TODO Hack to validate tag count until https://github.com/ansman/validate.js/pull/184 implemented
		if(_tagsSelected.length >= 3)
		{
			if(this.props.state && this.props.state.error_msgs && this.props.state.error_msgs.tags)
			{
				var _s = Object.assign({},this.props.state);
				delete _s.error_msgs.tags;
				this.props.updated(_s);
			}
		}
		// End of hack

		this.setState({tagsSelected:_tagsSelected}, function() {
			if(_this.props.tagSelected)
				_this.props.tagSelected(value);
			else
				_this.updateDisplayTags(value);

			if(values.length > 1)
			{
				values.shift();
				_this.tagSelectedUpdateState(values);
			}
		});
	},
	render:function() {
		var s = this.state;
		var p = this.props;
		var _this = this;

		var displayTagsPosition = p.displayTagsPosition || "before";

		return (
			<span>
				{p.headerText?<br/>:null}
				<div className={[tagsStyle.suggestWrapper, p.wrapperClassName].join(' ')} style={p.style ||{}}>
					{p.headerText ? <div style={{marginTop:16}} dangerouslySetInnerHTML={{__html:p.headerText}}/>:null}
					{s.displayTags && displayTagsPosition == "before" ?
						<span>
							{s.displayTags.map((tag,i) =>
					        	<span key={i}>
						        	{tag}
						        	{s.tagsSelected.length <= i ? null :
							        	<input value={s.tagsSelected[i].name} name={p.name+'[]'} type="hidden"/>
							        }
						        	{p.displayTagsJoin ? <AddSVG style={{float:'left',width:20,height:20,marginRight:30,marginTop:12}}/> : null}
				        		</span>
			        		)}
	        			</span>
					:null}

					{p.viewMode ? null :
						<div className={[tagsStyle.suggestSelect, p.suggestClassName].join(' ')} style={displayTagsPosition == "before" ? {float:'left'}:{}}>
							{/* AutoComplete property openOnFocus should not be set to true as its causes a bug whereby:
							 when focus/the cursor is on the AutoComplete then submit button has to be clicked twice*/}
							<AutoComplete
								id={p.id}
								ref="autocomplete"
								style={p.style || {}}
								hintText={<span style={p.hintTextStyle || {}}>{p.hintText}</span>}
								dataSource={s.requestId ?
									s.tagSuggestions.concat([{text:'',value:<MenuItem style={{height:20,marginTop:-25,overflow:'hidden'}} disabled={true}><Loading size={0.3}/></MenuItem>}]) 
									: s.tagSuggestions
								}
								filter={AutoComplete.noFilter}
								onUpdateInput={(val)=>{
									this.setState({
										tagInputTxt:val,
										tagSuggestions: val.length < s.tagInputTxt.length ? [] : s.tagSuggestions,
									});
									if(val.trim())
									{
										this.tagTextChanged(val);
									}
									else if(_this.getTagTimer)
									{
										window.clearTimeout(_this.getTagTimer);
										_this.getTagTimer = null;			
									}
								}}
								searchText={s.tagInputTxt}
								onNewRequest={(val) => {
									var value = val && val.text ? val.text : val;
									if(value && _this.indexOfTag(s.tagsSelected, value) == -1)
									{
										_this.tagSelectedUpdateState(value);

										if(this.getTagTimer)
										{
											window.clearTimeout(this.getTagTimer);
											this.getTagTimer = null;			
										}
									}
								}}
								errorText={p.state && p.state.error_msgs && p.state.error_msgs[p.name] ? p.state.error_msgs[p.name][0] : null}
								inputStyle={{textTransform:'lowercase'}}
								fullWidth={true}
					        />
					        {p.showSearchIcon === false ? null : <SearchSVG style={{position:'absolute',right:0,top:10,pointerEvents:'none'}} /> }
				        </div>
			        }

			        {displayTagsPosition == "before" ? <div className="clearFix"/> : null}

		        </div>
	        </span>
		);
	}
});	

module.exports = StdTagSuggest;