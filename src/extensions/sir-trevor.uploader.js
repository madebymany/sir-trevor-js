/*
*   Sir Trevor Uploader
*   Generic Upload implementation that can be extended for blocks
*/

SirTrevor.fileUploader = function(block, file, success, error) {

  var uid  = [block.blockID, (new Date()).getTime(), 'raw'].join('-');
  var data = new FormData();

  data.append('attachment[name]', file.name);
  data.append('attachment[file]', file);
  data.append('attachment[uid]', uid);

  block.resetMessages();

  var callbackSuccess = function(data){
    SirTrevor.log('Upload callback called');

    if (!_.isUndefined(success) && _.isFunction(success)) {
      _.bind(success, block)(data);
    }
  };

  var callbackError = function(jqXHR, status, errorThrown){
    SirTrevor.log('Upload callback error called');

    if (!_.isUndefined(error) && _.isFunction(error)) {
      _.bind(error, block)(status);
    }
  };

  var xhr = $.ajax({
    url: SirTrevor.DEFAULTS.uploadUrl,
    data: data,
    cache: false,
    contentType: false,
    processData: false,
    dataType: 'json',
    type: 'POST'
  });

  block.addQueuedItem(uid, xhr);

  xhr.done(callbackSuccess)
     .fail(callbackError)
     .always(_.bind(block.removeQueuedItem, block, uid));

  return xhr;
};