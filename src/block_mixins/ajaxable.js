SirTrevor.BlockMixins.Ajaxable = {

  mixinName: "Ajaxable",

  ajaxable: true,

  initializeAjaxable: function(){
    this._queued = [];
  },

  addQueuedItem: function(name, deffered) {
    SirTrevor.log("Adding queued item for " + this.blockID + " called " + name);
    SirTrevor.EventBus.trigger("onUploadStart");

    this._queued.push({ name: name, deffered: deffered });
  },

  removeQueuedItem: function(name) {
    SirTrevor.log("Removing queued item for " + this.blockID + " called " + name);
    SirTrevor.EventBus.trigger("onUploadStop");

    this._queued = _.reject(this._queued, function(queued){ return queued.name == name; });
  },

  hasItemsInQueue: function() {
    return this._queued.length > 0;
  },

  resolveAllInQueue: function() {
    _.each(this._queued, function(item){
      SirTrevor.log("Aborting queued request: " + item.name);
      item.deffered.abort();
    }, this);
  }

};