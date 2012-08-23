/* 
*   Sir Trevor Uploader
*   Generic Upload implementation that can be extended for blocks
*/

SirTrevor.fileUploader = function(block, file, callback) {
  
  var uid  = [block.instance.ID, (new Date()).getTime(), 'raw'].join('-');
  
  var data = new FormData();
  
  data.append('attachment[name]', file.name);
  data.append('attachment[file]', file);
  data.append('attachment[uid]', uid);
  
  var callbackSuccess = function(data){
    if (!_.isUndefined(callback) && _.isFunction(callback)) {
      _.bind(callback, block)(data); // Invoke with a reference to 'this' (the block)
    }
  };
  
  $.ajax({
    url: block.instance.options.uploadUrl,
    data: data,
    cache: false,
    contentType: false,
    processData: false,
    type: 'POST',
    success: _.bind(callbackSuccess, block)
  });
  
};