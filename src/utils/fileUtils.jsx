import React from 'react';

import 'whatwg-fetch';

const Loading = require('./loading');

var FileUtils = {

  save: function(file, fieldId, callbacks){
    this.fetchUploadURL(file.newname, file, fieldId, callbacks);
  },
  guid: function() { // Used to generate a filename
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
    this.s4() + '-' + this.s4() + this.s4() + this.s4();
  },
  s4: function() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  },
  fetchUploadURL: function(filename, file, fieldId, callbacks) {
    var _this = this;

    var formData = new FormData();
    formData.append("filename", filename);
    formData.append("status", "STATUS_UPLOADING");
    formData.append("fieldId", fieldId);

    fetch("/upload-file", {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      method:'POST',
      credentials: 'include',
      body: formData,
      }).then(function(response) {
        if(response.ok)
          return response.json();
        else
          throw new Error('Network response error');
    }).then(function(r) {
        console.log(r);
        _this.upload(file, r.url, fieldId, callbacks);
    }).catch(function(err) {
        console.log(err);
        if(callbacks && callbacks.failed)
          callbacks.failed();
    });
  },

  upload: function(fileData, url, fieldId, callbacks){

    var _this = this;

    var xhr, gapi = gapi, putUri, uploadedSoFar, parts, extra, sentParts;

    xhr = new XMLHttpRequest();

    var metadata = {
      'name': fileData.newname,
      'mimeType': fileData.type
    };
    metadata = JSON.stringify(metadata);

    xhr.open('POST', url + fileData.newname, true);
    xhr.setRequestHeader('X-Upload-Content-Type', fileData.type);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function (e) {
      if (xhr.readyState === 4) {
        putUri = xhr.getResponseHeader('location');
        if (putUri !== '') {

          console.log('UPLOADNG FILE TO CLOUD: ' + fileData.newname);

          var multipartRequestBody = fileData;
          xhr = new XMLHttpRequest();

          if(callbacks && callbacks.progress)
          {
            xhr.upload.addEventListener("progress", function (evt) {
              if (evt.lengthComputable) {
                var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                var bytesUploaded = evt.loaded;
                var bytesTransfered = '';
                var total = '';
                if (bytesUploaded > 1024 * 1024) {
                  bytesTransfered = (Math.round(bytesUploaded * 100 / (1024 * 1024)) / 100).toString() + 'MB';
                } else if (bytesUploaded > 1024) {
                  bytesTransfered = (Math.round(bytesUploaded * 100 / 1024) / 100).toString() + 'KB';
                } else {
                  bytesTransfered = (Math.round(bytesUploaded * 100) / 100).toString() + 'Bytes';
                }
                if (fileData.size > 1024 * 1024) {
                  total = (Math.round(fileData.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
                } else if (fileData.size > 1024) {
                  total = (Math.round(fileData.size * 100 / 1024) / 100).toString() + 'KB';
                } else {
                  total = (Math.round(fileData.size * 100) / 100).toString() + 'Bytes';
                }

                callbacks.progress(percentComplete, total, bytesTransfered);
              }

            }, false);
          }

          xhr.open('PUT', putUri, true);
          xhr.setRequestHeader('Content-Type', fileData.type);
          xhr.send(multipartRequestBody);

          xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4) {
              if(xhr.status === 200) {
                /*if(callbacks && callbacks.processing){
                  callbacks.processing();
                }
                if(callbacks && callbacks.progress){
                  callbacks.progress(100);
                }*/
                _this.uploadingComplete(fileData, fieldId, callbacks);
              } else{
                if(callbacks && callbacks.fail)
                callbacks.fail({status: 500});
              }
            }
          };
        }
      }
    };
    xhr.send(metadata);
  },

  uploadingComplete: function(file, fieldId, callbacks){

    console.log('Uploading complete');

    var formData = new FormData();
    formData.append("filename", file.newname);
    formData.append("status", "STATUS_OK");
    formData.append("fieldId", fieldId);

    fetch("/upload-file", {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      method:'POST', 
      credentials: 'include',
      body: formData}).then(function(response) {
        if(response.ok)
          return response.json();
        else
          throw new Error('Network response error');
    }).then(function(r) {
        console.log(r);
        if(callbacks && callbacks.success)
          callbacks.success();
    }).catch(function(err) {
        console.log(err);
        if(callbacks && callbacks.failed)
          callbacks.failed();
    });
  },
  uploadProgress:function(transfered, totalSize){
    return (
      <div style={{textAlign:'center',color:'#666'}}>
        <Loading size={0.5} />
        {!transfered ? <div>Uploading</div> :
          <div>
            {transfered} / {totalSize}
          </div>
        }
      </div>
    );
  },

  processing:function(){
    return (
      <div style={{textAlign:'center',color:'#666'}}>
        <Loading size={0.5} />
        Processing...
        <br/>
        Depending on the video size this can take a while!
      </div>
    );
  },
};

module.exports = FileUtils;
