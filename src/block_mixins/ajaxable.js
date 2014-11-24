SirTrevor.BlockMixins.Ajaxable = {

  mixinName: "Ajaxable",

  ajaxable: true,

  initializeAjaxable: function(){
    this._queued = [];
  },

  addQueuedItem: function(name, deferred) {
    SirTrevor.log("Adding queued item for " + this.blockID + " called " + name);
    SirTrevor.EventBus.trigger("onUploadStart", this.blockID);

    this._queued.push({ name: name, deferred: deferred });
  },

  removeQueuedItem: function(name) {
    SirTrevor.log("Removing queued item for " + this.blockID + " called " + name);
    SirTrevor.EventBus.trigger("onUploadStop", this.blockID);

    this._queued = this._queued.filter(function(queued) {
      return queued.name != name;
    });
  },

  hasItemsInQueue: function() {
    return this._queued.length > 0;
  },

  resolveAllInQueue: function() {
    this._queued.forEach(function(item){
      SirTrevor.log("Aborting queued request: " + item.name);
      item.deferred.abort();
    }, this);
  }

};
