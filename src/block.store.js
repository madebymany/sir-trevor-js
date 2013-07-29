SirTrevor.BlockStore = {

  blockStorage: {},

  createStore: function(blockData) {
    this.blockStorage = {
      type: this.type.toLowerCase(),
      data: blockData || {}
    };
  },

  save: function() { this.toData(); },

  getData: function() {
    return this.blockStorage.data;
  },

  setData: function(blockData) {
    SirTrevor.log("Setting data for block " + this.blockID);
    _.extend(this.blockStorage.data, blockData || {});
  },

  setAndRetrieveData: function(blockData) {
    this.setData(blockData);
    return this.getData();
  },

  toData: function() {},
  loadData: function() {},

  beforeLoadingData: function() {
    SirTrevor.log("loadData for " + this.blockID);
    SirTrevor.EventBus.trigger("editor/block/loadData");
    _.compose(this.loadData, this.getData);
  },

  _loadData: function() {
    SirTrevor.log("_loadData is deprecated and will be removed in the future. Please use beforeLoadingData instead.");
    this.beforeLoadingData();
  },

  checkAndLoadData: function() {
    if (!_.isEmpty(this.getData())) {
      this.beforeLoadingData();
    }
  }

};