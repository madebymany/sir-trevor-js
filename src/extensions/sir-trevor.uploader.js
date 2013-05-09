/* 
*   Sir Trevor Uploader
*   Generic Upload implementation that can be extended for blocks
*/

SirTrevor.fileUploader = function(block, file, success, error) {
  
  SirTrevor.publish("onUploadStart");
  
  var uid  = [block.instance.ID, (new Date()).getTime(), 'raw'].join('-');
  
  var data = new FormData();
  
  data.append('attachment[name]', file.name);
  data.append('attachment[file]', file);
  data.append('attachment[uid]', uid);
  
  var callbackSuccess = function(data){
    if (!_.isUndefined(success) && _.isFunction(success)) {
      SirTrevor.log('Upload callback called');
      SirTrevor.publish("onUploadStop");
      _.bind(success, block)(data);
    }
  };
  
  var callbackError = function(jqXHR, status, errorThrown){
    if (!_.isUndefined(error) && _.isFunction(error)) {
      SirTrevor.log('Upload callback error called');
      SirTrevor.publish("onUploadError");
      _.bind(error, block)(status); 
    }
  };
  
  $.ajax({
    url: block.instance.options.uploadUrl,
    data: data,
    cache: false,
    contentType: false,
    processData: false,
    type: 'POST',
    success: callbackSuccess,
    error: callbackError
  });
  
};
