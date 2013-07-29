SirTrevor.BlockMixins.Ajaxable = {

  mixinName: "Ajaxable",

  _queued: [],
  ajaxable: true,

  initializeAjaxable: function(){},

  addQueuedItem: function(name, deffered) {
    SirTrevor.log("Adding queued item for " + this.blockID + " called " + name);
    this._queued.push({ name: name, deffered: deffered });
  },

  removeQueuedItem: function(name) {
    SirTrevor.log("Removing queued item for " + this.blockID + " called " + name);
    this._queued = _.filter(this._queued, function(item){
                             return item.name != name; });
  },

  hasItemsInQueue: function() {
    return this._queued.length > 0;
  },

  resolveAllInQueue: function() {
    _.each(this._queued, function(item){
      item.deffered.abort();
    }, this);
  }

};