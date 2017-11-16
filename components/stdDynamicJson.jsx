const React = require('react');

var Component = require('xbuilder-forms/wrappers/component');

import TextField from 'material-ui/TextField';
import ArrowDownIcon from 'material-ui/svg-icons/navigation/arrow-downward';

const AppState = require('xbuilder-core/lib/appState');

import 'whatwg-fetch';

const StdDynamicJson = Component(React.createClass({
  getInitialState(){
    return {
      // acceptedArguements:null
    };
  },
  getInfo(){
    var _this = this;
    var s = this.props.state;
    var p = this.props;
    var _s = this.state;

    var formData = new FormData();

    //{"_type": "XQL_query", "_data": [{"_type":"select","_data":{"from":"asd"}},{"_type":"where","_data":{"_type":"eq","_data":{}}}]}
    // var testData = JSON.stringify(window.testObj);

    var query = [];
    for(var i = 0; i< this.acceptedArguements.length; i++)
    {
      query.push({
        _type: this.acceptedArguements[i]._type,
        _data: this.acceptedArguements[i].acceptedArguements
      });
    }

    var testData = JSON.stringify({"_type": "XQL_query", "_data":query});
    formData.append("value", this.refs[p.name].getValue() || testData);

    //Create URL
    var requestUrl = p.field.options.infoUrl;
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
            throw new Error('Network response error');
    }).then(function(r) {
        _this.acceptedArguements = r.data.acceptedArguements;
        _this.forceUpdate();
        // _this.setState({acceptedArguements: r.data.acceptedArguements});
    }).catch(function(err) {
        console.log(err);
    });
  },
  acceptedArguements: [],
  getComponents(acceptedArguements){
    var _this = this;
    var components = [];

    for(var i = 0; i< acceptedArguements.length; i++)
    {
      if(acceptedArguements[i].acceptedArguements && !acceptedArguements[i].acceptedArguements.length && (i == acceptedArguements.length -1 || !acceptedArguements[i+1].acceptedArguements.length))
      {
        var selectOptions = [<option key={-1}>Select one:</option>];
        for(var j = i; j < acceptedArguements.length; j++)
        {
          selectOptions.push(<option value={j}>{acceptedArguements[j]._type}</option>);
        }
        components.push(<select onChange={(event)=>{
            acceptedArguements[event.target.value].acceptedArguements=[];
            console.log(_this.acceptedArguements);
            _this.getInfo();
          }}>{selectOptions}</select>);
        return components;
      }

      switch(acceptedArguements[i]._type)
      {
        case "string":
          components.push(<input type="text" value={acceptedArguements[i].name} />);
          break;
        default:
          var selectOptions = [];
          if(acceptedArguements[i].hasOwnProperty("acceptedArguements") && !acceptedArguements[i].acceptedArguements.length)
            selectOptions.push(<option key={-1}>Select one:</option>);

          selectOptions.push(<option key={i} value={i}>{acceptedArguements[i]._type}</option>)
          
          components.push(<select key={0} onChange={(event)=>{
            acceptedArguements[event.target.value].acceptedArguements=[];
            console.log(_this.acceptedArguements);
            _this.getInfo();
          }}>{selectOptions}</select>);

          if(acceptedArguements[i].hasOwnProperty("acceptedArguements") && acceptedArguements[i].acceptedArguements.length)
            components.push(this.getComponents(acceptedArguements[i].acceptedArguements));

          break;
      }
    }


    return components;
  },
  render: function() {
    var s = this.props.state;
    var p = this.props;

    var mui_props = {
      id:p.id,
      name: p.name,
      multiLine:true,
      style:{display:'none'}
    };

    return (
      <div>
        <TextField
          {...mui_props}
          ref={p.name}
          value={s.data[p.name]}
        />
        {this.acceptedArguements.length == 0 ?
          <div onClick={()=>this.getInfo()}>Add options</div>
        :
          this.getComponents(this.acceptedArguements)
        }
      </div>

  );}
}));

module.exports = StdDynamicJson;
