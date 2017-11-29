const React = require('react');

var Component = require('xbuilder-forms/wrappers/component');

import IconButton from 'material-ui/IconButton';
import ArrowBackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import ArrowForwardIcon from 'material-ui/svg-icons/navigation/arrow-forward';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import TextField from 'material-ui/TextField';
import ArrowDownIcon from 'material-ui/svg-icons/navigation/arrow-downward';

const AppState = require('xbuilder-core/lib/appState');

import 'whatwg-fetch';

const StdDynamicJson = Component(React.createClass({
  componentDidMount(){
    if(this.props.initialValue)
    {
      var initialArgs = JSON.parse(this.props.initialValue);
      console.log(initialArgs);

      var formData = new FormData();
      formData.append("value", JSON.stringify(initialArgs));

      this.makeRequest('/apps/:appId/dynamicJsonFieldInfoInitialize', formData);
    }
    else
    {
      this.getInfo();
    }
  },
  buildXDB(acceptedArguements){
    if(!acceptedArguements)
      return [];

    var query = [];

    for(var i = 0; i< acceptedArguements.length; i++)
    {
      var arg = acceptedArguements[i];

      if(arg._data && !arg._data.length && i < acceptedArguements.length -1 && acceptedArguements[i+1]._data && !acceptedArguements[i+1]._data.length)
        return query;


      if(arg._type == "input")
      {
        var o = {};
        o[arg._name] = arg._value;
        query.push(o);
      }
      else
      {
        query.push({
          _type: arg._type,
          _data: this.buildXDB(arg._data)
        });
      }
    }

    return query;
  },
  getInfo(){
    var p = this.props;

    var formData = new FormData();
    var data  = this.buildXDB(this.acceptedArguements);
    p.updated(JSON.stringify(data));
    data = JSON.stringify({_type:"root", _data:data});
    formData.append("value", data);

    this.makeRequest('/apps/:appId/dynamicJsonFieldInfo', formData);
  },
  history:[],
  historyPointer:0,
  makeRequest(requestUrl, formData){
    var _this = this;

    var urlParts = requestUrl.split('/');
    for(var i = 0; i < urlParts.length; i++)
      if(urlParts[i][0] == ':')
        urlParts[i] = AppState.getProp('routeParams.'+urlParts[i].substring(1)); 
    requestUrl = urlParts.join('/');

    fetch(requestUrl + '?XDEBUG_SESSION_START=netbeans-xdebug',{
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
      method:'POST',
      body: formData,
      credentials: 'include',
    }).then(function(response) {
        if(response.ok) 
            return response.json();
        else
            throw response;
    }).then(function(r) {
        _this.history.push(Object.assign(r._data));
        if(_this.history.length > 20)
          _this.history.splice(0, 1);
        _this.historyPointer = _this.history.length - 1;
        _this.acceptedArguements = r._data;
        _this.forceUpdate();
    }).catch(function(err) {
        err.text().then( errorMessage => {
          // Display console error in full
          console.log(JSON.stringify(JSON.parse(errorMessage).console,true,2));
        })
    });
  },
  acceptedArguements: [],
  elmStyles:{verticalAlign:'middle',marginRight:10},
  getComponents(acceptedArguements){
    var _this = this;
    var components = [];
    var showMoreGroup = {idx:null,components:[]};

    for(var i = 0; i< acceptedArguements.length; i++)
    {
      var arg = acceptedArguements[i];
      var styleSpan = [];
      var style= {};
      if(arg._nl)
        style.display = 'block';
      if(arg._indent)
        style.marginLeft = 10;

      // ***** CONSECUTIVE acceptedArguements ITEMS WITH EMPTY _data PROPERTIES
      // ***** PLACE INTO A SELECT COMPONENT  
      if(arg._data && !arg._data.length && (i == acceptedArguements.length -1 || !acceptedArguements[i+1]._data.length))
      {

        var selectOptions = [<MenuItem key={"o-"+i} value={null} primaryText={arg._promptDisplay || "Select one:"}/>];
        for(var j = i; j < acceptedArguements.length; j++)
          if(acceptedArguements[j]._type != "singleIgnoreHelper")
            selectOptions.push(<MenuItem key={"o"+j+i} value={j} primaryText={acceptedArguements[j]._display || acceptedArguements[j]._type}/>);


        styleSpan.push(<SelectField autoWidth={true} style={this.elmStyles} key={"s"+i} value={null} onChange={(event,index,value)=>{
          if(acceptedArguements[Number(value)]._setData)
            acceptedArguements[Number(value)]._data = acceptedArguements[Number(value)]._setData;

          var j = acceptedArguements.length;
          while(j--){
            if(j != Number(value) && acceptedArguements[j]._data && !acceptedArguements[j]._data.length)
              acceptedArguements.splice(j, 1);
          }
            _this.getInfo();
          }}>{selectOptions}</SelectField>);

        components.push(<span key={"span"+i} style={style}>{styleSpan}</span>);

        return components;
      }

      switch(arg._type)
      {
        // ***** _type PROPERTY IS NOT A SERVERSIDE OBJECT  
        case "input":
          if(arg._hide)
            break;

          if(arg._options)
          {
            var selectOptions = [<MenuItem key={"o-"+i} value={null} primaryText={arg._promptDisplay || "Select one:"}/>];
            for(var key in arg._options)
              selectOptions.push(<MenuItem key={"o"+i+key} value={key} primaryText={arg._options[key]}/>);
            
            ((arg)=>{
              styleSpan.push(<SelectField autoWidth={true} style={this.elmStyles} key={"s"+i} value={arg._value || null} onChange={(event,index,value)=>{
                if(arg._toObj)
                {
                  arg._type = arg._toObj;
                  arg._data = [{_type:"input", _name:arg._name, _value:value, _display: arg._options[value]}];
                }
                else
                  arg._value=value || null;
                _this.getInfo();
              }}>{selectOptions}</SelectField>);

              components.push(<span key={"span"+i} style={style}>{styleSpan}</span>);
            })(arg);
          }
          else
          { 
            ((arg)=>{
              var componentProps = {
                style:this.elmStyles,
                key:"i"+i,
                name:"Ti"+i,
              }

              // No edit
              if(arg._value)
                styleSpan.push(<span {...componentProps}>{arg._display || arg._value}</span>);
              else
                styleSpan.push(<TextField  {...componentProps} type="text" placeholder={arg._name} defaultValue={arg._display || null} onBlur={(event)=>{
                  if(arg._value != event.target.value && (arg._value || event.target.value))
                  { 
                    arg._value = event.target.value;
                    _this.getInfo();
                  }
                }}/>);

              if(arg._showMoreGroup || arg._showMoreGroup === 0)
              {
                showMoreGroup.idx = arg._showMoreGroup;
                showMoreGroup.components.push(<span key={"span"+i} style={style}>{styleSpan}</span>);
              }
              else
                components.push(<span key={"span"+i} style={style}>{styleSpan}</span>);
            })(arg);
          }
          break;
        // ***** _type PROPERTY IS A SERVERSIDE OBJECT  
        default:
          var styleSpan = [];

          if(!arg._hide)
          {
            var selectOptions = [];
            // selectOptions.push(<option key={"o"+i} value={i}>{arg._type}</option>)
            selectOptions.push(<MenuItem key={"o"+i} value={i} primaryText={arg._display || arg._type}/>)

            styleSpan.push(
              <SelectField
                autoWidth={true} 
                style={this.elmStyles}
                key={"sel"+i}
                value={i}
                onChange={(event,index,value)=>{
                  var j = acceptedArguements.length;
                  while(j--){
                    if(j != Number(value) && acceptedArguements[j]._data && !acceptedArguements[j]._data.length)
                      acceptedArguements.splice(j, 1);
                  }
                  console.log(_this.acceptedArguements);
                  _this.getInfo();
                }}
              >{selectOptions}</SelectField>
            );
          }

          if(arg.hasOwnProperty("_data") && arg._data.length)
            styleSpan.push(this.getComponents(arg._data));


          if(arg._showMoreGroup || arg._showMoreGroup === 0)
          {
            showMoreGroup.idx = arg._showMoreGroup;
            showMoreGroup.components.push(<span key={"span"+i} style={style}>{styleSpan}</span>);
          }
          else
            components.push(<span key={"span"+i} style={style}>{styleSpan}</span>);

          break;
      }
    }

    if(showMoreGroup.components.length)
      components.splice(showMoreGroup.idx, 0, <span key="smg">
          <button type="button" style={Object.assign({},this.elmStyles,{padding:0})} onClick={(event)=>{
            event.target.nextSibling.style.display = 'inline';
            event.target.style.display = 'none';
          }}>...</button>
          <span style={{display:'none'}}>{showMoreGroup.components}</span>
        </span>);

    return components;
  },
  render: function() {
    var _this = this;

    return (
      <div>
        <IconButton
          iconStyle={{width: 18,height: 18}}
          style={{width: 34,height: 34,padding: 8}}
          tooltip="Back"
          disabled={_this.history.length <= 1 || _this.historyPointer == 0}
          onClick={()=>{
            _this.historyPointer--;
            _this.acceptedArguements = _this.history[_this.historyPointer];
            _this.forceUpdate();
        }}>
          <ArrowBackIcon />
        </IconButton>
        <IconButton
          iconStyle={{width: 18,height: 18}}
          style={{width: 34,height: 34,padding: 8}}
          tooltip="Forward"
          disabled={_this.history.length <= 1 || _this.historyPointer == _this.history.length - 1}
          onClick={()=>{
          _this.historyPointer++;
          _this.acceptedArguements = _this.history[_this.historyPointer];
          _this.forceUpdate();
        }}>
          <ArrowForwardIcon />
        </IconButton>
        <br/>
        {this.getComponents(this.acceptedArguements)}
      </div>

  );}
}));

module.exports = StdDynamicJson;
