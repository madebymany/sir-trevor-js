SirTrevor.BlockMixins.Fetchable = {

  mixinName: "Fetchable",

  initializeFetchable: function(){
    this.withMixin(SirTrevor.BlockMixins.Ajaxable);
  },

  fetch: function(options, success, failure){
    var uid  = [this.blockID, (new Date()).getTime(), 'upload'].join('-');
    var deffered = $.ajax(options);

    this.resetMessages();
    this.addQueuedItem(uid, deffered);

    var afterFetch = _.bind(function(){
      this.removeQueuedItem(uid);
    }, this);

    deffered.done(_.bind(success, this))
            .fail(_.bind(failure, this))
            .always(afterFetch);
  }

};