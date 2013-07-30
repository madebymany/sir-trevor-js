SirTrevor.BlockMixins.Fetchable = {

  mixinName: "Fetchable",

  initializeFetchable: function(){
    this.withMixin(SirTrevor.BlockMixins.Ajaxable);
  },

  fetch: function(options, success, failure){
    var uid = _.uniqueId(this.blockID + "_fetch"),
        xhr = $.ajax(options);

    this.resetMessages();
    this.addQueuedItem(uid, xhr);

    if(!_.isUndefined(success)) {
      xhr.done(_.bind(success, this));
    }

    if(!_.isUndefined(failure)) {
      xhr.fail(_.bind(failure, this));
    }

    xhr.always(_.bind(this.removeQueuedItem, this, uid));

    return xhr;
  }

};