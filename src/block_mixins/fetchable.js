SirTrevor.BlockMixins.Fetchable = {

  mixinName: "Fetchable",

  initializeFetchable: function(){
    this.withMixin(SirTrevor.BlockMixins.Ajaxable);
  },

  fetch: function(options, success, failure){
    var uid  = [this.blockID, (new Date()).getTime(), 'upload'].join('-'),
        xhr = $.ajax(options);

    this.resetMessages();
    this.addQueuedItem(uid, xhr);

    var afterFetch = _.bind(function(){
      this.removeQueuedItem(uid);
    }, this);

    if(!_.isUndefined(success)) {
      xhr.done(_.bind(success, this));
    }

    if(!_.isUndefined(failure)) {
      xhr.fail(_.bind(failure, this));
    }

    xhr.always(afterFetch);

    return xhr;
  }

};