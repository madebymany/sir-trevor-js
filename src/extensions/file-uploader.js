"use strict";

/*
*   Sir Trevor Uploader
*   Generic Upload implementation that can be extended for blocks
*/

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');
var Ajax = require('../packages/ajax');

var EventBus = require('../event-bus');

module.exports = function(parent, uploadUrl, file, success, error) {

  EventBus.trigger('onUploadStart');

  var uid  = [parent.blockID, (new Date()).getTime(), 'raw'].join('-');
  var data = new FormData();

  data.append('attachment[name]', file.name);
  data.append('attachment[file]', file);
  data.append('attachment[uid]', uid);

  var callbackSuccess = function(data) {
    utils.log('Upload callback called');
    EventBus.trigger('onUploadStop', data);

    if (!_.isUndefined(success) && _.isFunction(success)) {
      success.apply(parent, arguments, data);
    }

    // block.removeQueuedItem(uid);
  };

  var callbackError = function(jqXHR, status, errorThrown) {
    utils.log('Upload callback error called');
    EventBus.trigger('onUploadStop', undefined, errorThrown, status, jqXHR);

    if (!_.isUndefined(error) && _.isFunction(error)) {
      error.call(parent, status);
    }

    // block.removeQueuedItem(uid);
  };

  var url = uploadUrl || config.defaults.uploadUrl;

  var xhr = Ajax.fetch(url, {
    body: data,
    method: 'POST',
    dataType: 'json'
  });

  // block.addQueuedItem(uid, xhr);

  xhr.then(callbackSuccess)
     .catch(callbackError);

  return xhr;
};
