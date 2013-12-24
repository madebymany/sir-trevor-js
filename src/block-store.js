SirTrevor.BlockStore = {

  blockStorage: {},

  createStore: function(blockData) {
    this.blockStorage = {
      type: _.underscored(this.type),
      data: blockData || {}
    };
  },

  save: function() { 
    var data = this._serializeData(); 

    if (!_.isEmpty(data)) {
      this.setData(data);
    }
  },

  saveAndReturnData: function() {
    this.save();
    return this.blockStorage;
  },

  saveAndGetData: function() {
    var store = this.saveAndReturnData();
    return store.data || store;
  },

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

  setAndLoadData: function(blockData) {
    this.setData(blockData);
    this.beforeLoadingData();
  },

  _serializeData: function() {},
  loadData: function() {},

  beforeLoadingData: function() {
    SirTrevor.log("loadData for " + this.blockID);
    SirTrevor.EventBus.trigger("editor/block/loadData");
    this.loadData(this.getData());
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