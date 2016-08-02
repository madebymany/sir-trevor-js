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

module.exports = function(block, file, success, error) {
  var uid  = [block.blockID, (new Date()).getTime(), 'raw'].join('-');
  var data = new FormData();
  var attachmentName = block.attachmentName || config.defaults.attachmentName;
  var attachmentFile = block.attachmentFile || config.defaults.attachmentFile;
  var attachmentUid = block.attachmentUid || config.defaults.attachmentUid;

  data.append(attachmentName, file.name);
  data.append(attachmentFile, file);
  data.append(attachmentUid, uid);

  EventBus.trigger('onUploadStart', data);

  block.resetMessages();

  var callbackSuccess = function(data) {
    utils.log('Upload callback called');
    EventBus.trigger('onUploadStop', data);

    if (!_.isUndefined(success) && _.isFunction(success)) {
      success.apply(block, arguments, data);
    }

    block.removeQueuedItem(uid);
  };

  var callbackError = function(jqXHR, status, errorThrown) {
    utils.log('Upload callback error called');
    EventBus.trigger('onUploadStop', undefined, errorThrown, status, jqXHR);

    if (!_.isUndefined(error) && _.isFunction(error)) {
      error.call(block, status);
    }

    block.removeQueuedItem(uid);
  };

  var url = block.uploadUrl || config.defaults.uploadUrl;

  var xhr = Ajax.fetch(url, {
    body: data,
    method: 'POST',
    dataType: 'json'
  });

  block.addQueuedItem(uid, xhr);

  xhr.then(callbackSuccess)
     .catch(callbackError);

  return xhr;
};
