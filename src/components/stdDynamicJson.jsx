const React = require('react');

var Component = require('../wrappers/component');

import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import ExpandIcon from 'material-ui/svg-icons/navigation/more-vert';
import ArrowBackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import ArrowForwardIcon from 'material-ui/svg-icons/navigation/arrow-forward';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import TextField from 'material-ui/TextField';
import {Card,CardText} from 'material-ui/Card';
import ArrowDownIcon from 'material-ui/svg-icons/navigation/arrow-downward';

// const AppState = require('xbuilder-core/lib/appState');

var Style = require('../style/dynamicJson.css');

import 'whatwg-fetch';

const LASTEST_VERSION = 2;

const StdDynamicJson = Component(React.createClass({
  componentDidMount(){
    if(this.props.initialValue)
    {
      var initialArgs = JSON.parse(this.props.initialValue);
      console.log(initialArgs);

      var version = this.getVersion();
      if(version)
      {
        var formData = new FormData();
        formData.append("value", JSON.stringify(initialArgs));
        formData.append('version', version);

        this.makeRequest('/apps/:appId/dynamicJsonFieldInfoInitialize', formData);
      }
    }
    else
    {
      this.clientMetaStructureUpdated();
    }
  },
  getVersion(){
    var version = LASTEST_VERSION;
    var processName = this.props.state.data.processName; // Expecting something like 'XDB1'
    if(processName && processName.substring(0,3) == 'XDB')
      version = processName.substring(3) || 1;
    return version;
  },
  buildXDB(clientMetaStructure){
    if(!clientMetaStructure)
      return [];

    var query = [];

    for(var i = 0; i< clientMetaStructure.length; i++)
    {
      var arg = clientMetaStructure[i];

      if(arg._data && !arg._data.length && i < clientMetaStructure.length -1 && clientMetaStructure[i+1]._data && !clientMetaStructure[i+1]._data.length)
        return query;


      if(arg._type == "input")
      {
        var o = {};
        o[arg._name] = arg._value;
        query.push(o);
      }
      else
      {
        var o = {
          _type: arg._type,
          _data: this.buildXDB(arg._data)
        };

        if(arg._type == 'emptyObjectsWrapper')
        {
          // If then the emptyObjectsWrapper contains nothing
          // then ignore it and add nothing to query
          if(o._data.length)
          {
            // If it does contain something then it will only contain
            // one item. Add this item to query. In essence we are
            // removing emptyObjectsWrapper but adding it's child.
            // There is futher explaination as to why the emptyObjectsWrapper
            // is necessary in the server side documentation. 
            query.push(o._data[0]);  
          }
        }
        else
          query.push(o);
      }
    }

    return query;
  },
  clientMetaStructureUpdated(){
    var p = this.props;

    var version = this.getVersion();
    if(version)
    {
      var formData = new FormData();
      var data  = this.buildXDB(this.clientMetaStructure);
      p.updated(JSON.stringify(data));
      data = JSON.stringify(data);
      formData.append("value", data);
      formData.append("version", version);

      this.makeRequest('/apps/:appId/dynamicJsonFieldInfo', formData);
    }
  },
  history:[],
  historyPointer:0,
  makeRequest(requestUrl, formData){
    var _this = this;

    var urlParts = requestUrl.split('/');
    for(var i = 0; i < urlParts.length; i++)
      if(urlParts[i][0] == ':')
        // urlParts[i] = AppState.getProp('routeParams.'+urlParts[i].substring(1)); 
        console.log("AppState call needs replaced");
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
        _this.clientMetaStructure = [];
        _this.clientMetaStructure = r._data;
        _this.forceUpdate();
    }).catch(function(err) {
        err.text().then( errorMessage => {
          // Display console error in full
          console.log(JSON.stringify(JSON.parse(errorMessage).console,true,2));
        })
    });
  },
  clientMetaStructure: [],
  elmStyles:{verticalAlign:'middle',marginRight:10,height:48,lineHeight:'48px',width:'auto'},
  buildGUI(clientMetaStructure){
    var _this = this;
    var components = [];
    var showMoreGroup = {idx:null,components:[]};

    
    function addComponent(_clientMetaStructure, i, component)
    {
      var arg = _clientMetaStructure[i];
      var style = _this.getStyle(arg);
      if(arg._showMoreGroup || arg._showMoreGroup === 0)
       {
        showMoreGroup.idx = arg._showMoreGroup;
        showMoreGroup.components.push(<span key={"span"+i} style={style}>{component}</span>);
      }
      else
      {
        component = <span key={"span"+i} style={style} className={arg._root && arg._data.length ? Style.rootProcess : null}>{component}</span>
        if(arg._root)
          component = _this.getRootComponent(_clientMetaStructure, i, component);
        components.push(component);
      }
    }


    for(var i = 0; i< clientMetaStructure.length; i++)
    {
      var consecutiveEmptyObjects = this.testConsecutiveEmptyObjects(clientMetaStructure, i);
      if(consecutiveEmptyObjects)
      {
        addComponent(clientMetaStructure, i, consecutiveEmptyObjects);
        // Break here instead of returning the components immediately so that
        // any previously configured showMoreGroup can be added
        break;
      }

      var arg = clientMetaStructure[i];
      if(clientMetaStructure[i]._type == "input")
      {
        if(!clientMetaStructure[i]._hide)
        {
          if(clientMetaStructure[i]._options)
          {
            var optionsInput = this.getOptionsInput(clientMetaStructure, i);
            addComponent(clientMetaStructure, i, optionsInput);
          }
          else
          { 
            var textInput = this.getTextInput(clientMetaStructure, i);
            addComponent(clientMetaStructure, i, textInput);
          }
        }
      } 
      else
      {
        var nonInputObject = this.nonInputObject(clientMetaStructure, i);
        addComponent(clientMetaStructure, i, nonInputObject);
      }
    }


    if(showMoreGroup.components.length)
    {
            // onClick={(e)=>{
            // e.target.nextSibling.style.display = 'inline-block';
            // e.target.style.display = 'none';
            // // Remove any potential double margin
            // if(e.target.nextSibling.firstChild.style.marginLeft=='10px')
            //   e.target.parentNode.style.marginLeft=0;
      components.splice(showMoreGroup.idx=="start" ? 0 : (showMoreGroup.idx=="end" ? components.length : showMoreGroup.idx) , 0, <span key="smg">
          <Card>
            <CardText>
              {showMoreGroup.components}
            </CardText>
          </Card>
        </span>);
    }

    return components;
  },
  getRootComponent(clientMetaStructure, i, component) {
    var _this = this;

    return (
      <Card className={Style.processCard} key={"card"+i}>
        <CardText>
          {clientMetaStructure[i]._data.length ?
            <IconMenu
              iconButtonElement={<IconButton><ExpandIcon /></IconButton>}
              anchorOrigin={{horizontal: 'left', vertical: 'top'}}
              targetOrigin={{horizontal: 'left', vertical: 'top'}}
              className={Style.processCardMenu}
            >
              <MenuItem
                style={{minHeight:30,lineHeight:'30px',padding:'4px 0',fontSize:'12px'}}
                innerDivStyle={{padding:'0 8px'}}
                primaryText="Remove"
                onClick={()=>{
                  clientMetaStructure.splice(i,1);
                  _this.clientMetaStructureUpdated();
                }}
              />
            </IconMenu>
          :null}
          {component}
        </CardText>
      </Card>
    );
  },
  getStyle(arg) {
    if(arg._root)
      return {display:'block'};

    var style = {display:'inline',verticalAlign:'top'};
    if(arg._nl)
      style.display = 'block'; // Like inline-block but breaks line
    if(arg._indent)
      style.marginLeft = 10;
    if(arg._incomplete)
      style.background = 'rgb(234, 248, 255)';//Light green

    return style;
  },
  getTextInput(clientMetaStructure, i) {
    var _this = this;
    var arg = clientMetaStructure[i];
    var componentGroup = [];

    ((arg)=>{
      var componentProps = {
        style:this.elmStyles,
        key:"i"+i,
      }

      var textfield = <TextField name={"Ti"+i} type="text" placeholder={arg._name} defaultValue={arg._display || arg._value || null} onBlur={(event)=>{
          if(arg._value != event.target.value && (arg._value || event.target.value))
          { 
            arg._value = event.target.value;
            _this.clientMetaStructureUpdated();
          }
        }}/>;

      // No edit
      if(arg._value)
        componentGroup.push(<span {...componentProps}>
          <span onClick={(e)=>{
            e.target.nextSibling.style.display = 'inline-block';
            e.target.style.display = 'none';
          }}>{arg._display || arg._value}</span>
          <span style={{display:'none'}}>{textfield}</span>
        </span>);
      else
        componentGroup.push(<span {...componentProps}>{textfield}</span>);
    })(arg);

    return componentGroup;
  },
  getOptionsInput(clientMetaStructure, i){
    var _this = this;
    var arg = clientMetaStructure[i];
    var componentGroup = [];

    var selectOptions = [<MenuItem key={"o-"+i} value={null} primaryText={arg._promptDisplay || "Select one:"}/>];
    for(var key in arg._options)
      selectOptions.push(<MenuItem key={"o"+i+key} value={key} primaryText={arg._options[key]}/>);
    
    ((arg)=>{
      componentGroup.push(<SelectField autoWidth={true} style={this.elmStyles} key={"s"+i} value={arg._value || null} onChange={(event,index,value)=>{
        if(arg._toObj)
        {
          arg._type = arg._toObj;
          arg._data = [{_type:"input", _name:arg._name, _value:value, _display: arg._options[value]}];
        }
        else
          arg._value=value || null;
        _this.clientMetaStructureUpdated();
      }}>{selectOptions}</SelectField>);

    })(arg);

    return componentGroup;
  },
  nonInputObject(clientMetaStructure, i){
    var _this = this;
    var arg = clientMetaStructure[i];

    var componentGroup = [];

    if(!arg._hide)
    {
      var selectOptions = [];
      var selectedIdx = null;
      if(arg._options)
      {
        selectOptions.push(<MenuItem key={"menu"} value={null} primaryText={arg._options[0]._promptDisplay || "Select one:"}/>);
        for(var j = 0; j < arg._options.length; j++)
        {
          if(arg._options[j]._type == arg._type)
            selectedIdx = j;
          selectOptions.push(<MenuItem key={"menu"+j} value={j} primaryText={arg._options[j]._display}/>);
        }

        componentGroup.push(
            <SelectField
              autoWidth={true}
              style={this.elmStyles}
              key={"sel"}
              value={selectedIdx}
              onChange={(event,index,value)=>{
                if(value === null)
                {
                  // The null option is selected therefore empty the passed clientMetaStructure 
                  clientMetaStructure.splice(i,1);
                  _this.clientMetaStructureUpdated();
                }
                else if(value != selectedIdx)
                {
                  // Changing the _type will update any child _data contents
                  arg._type = arg._options[value]._type;
                  _this.clientMetaStructureUpdated();
                }
              }}
            >{selectOptions}</SelectField>
          );
      }
      else
      {
        componentGroup.push(<span key={"sp"} style={this.elmStyles}>{arg._display || arg._type}</span>);
      }
    }

    if(arg.hasOwnProperty("_data") && arg._data.length)
      componentGroup.push(this.buildGUI(arg._data));

    return componentGroup;
  },
  testConsecutiveEmptyObjects(clientMetaStructure, i){
    var arg = clientMetaStructure[i];
    // ***** CONSECUTIVE clientMetaStructure ITEMS WITH EMPTY _data PROPERTIES
    // ***** PLACE INTO A SELECT COMPONENT  
    if(arg._data && !arg._data.length && (i == clientMetaStructure.length -1 || !clientMetaStructure[i+1]._data.length))
    {

      var selectOptions = [<MenuItem key={"o-"+i} value={null} primaryText={arg._promptDisplay || "Select one:"}/>];
      for(var j = i; j < clientMetaStructure.length; j++)
        if(clientMetaStructure[j]._type != "singleIgnoreHelper")
          selectOptions.push(<MenuItem key={"o"+j+i} value={j} primaryText={clientMetaStructure[j]._display || clientMetaStructure[j]._type}/>);


      var _this = this;

      return (<SelectField autoWidth={true} style={this.elmStyles} key={"s"+i} value={null} onChange={(event,index,value)=>{
        if(clientMetaStructure[Number(value)]._setData)
          clientMetaStructure[Number(value)]._data = clientMetaStructure[Number(value)]._setData;

        var j = clientMetaStructure.length;
        while(j--){
          if(j != Number(value) && clientMetaStructure[j]._data && !clientMetaStructure[j]._data.length)
            clientMetaStructure.splice(j, 1);
        }
          _this.clientMetaStructureUpdated();
        }}>{selectOptions}</SelectField>);
    }
  },
  render: function() {
    var _this = this;

    return (
      <div>
        Define processes that will be executed when this route is requested
        <br/>
        <IconButton
          iconStyle={{width: 18,height: 18}}
          style={{width: 34,height: 34,padding: 8}}
          tooltip="Back"
          disabled={_this.history.length <= 1 || _this.historyPointer == 0}
          onClick={()=>{
            _this.historyPointer--;
            _this.clientMetaStructure = _this.history[_this.historyPointer];
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
          _this.clientMetaStructure = _this.history[_this.historyPointer];
          _this.forceUpdate();
        }}>
          <ArrowForwardIcon />
        </IconButton>
        <br/>
        <div className={Style.processesContainer}>
          {this.buildGUI(this.clientMetaStructure)}
        </div>
      </div>

  );}
}));

module.exports = StdDynamicJson;
