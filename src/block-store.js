SirTrevor.BlockStore = {

  /**
   * Internal storage object for the block
   */
  blockStorage: {},

  /**
   * Initialize the store, including the block type
   */
  createStore: function(blockData) {
    this.blockStorage = {
      type: _.underscored(this.type),
      data: blockData || {}
    };
  },

  /**
   * Serialized the block and saves the data into the store
   */
  save: function() {
    var data = this._serializeData();

    if (!_.isEmpty(data)) {
      this.setData(data);
    }
  },

  /**
   * Get the full data object, including block type, etc
   */
  getData: function() {
    this.save();
    return this.blockStorage;
  },

  /**
   * Get the block's specific data
   */
  getBlockData: function() {
    this.save();
    return this.blockStorage.data;
  },

  /**
   * Internal method to get the block's data
   */
  _getData: function() {
    return this.blockStorage.data;
  },

  /**
   * Set the block data.
   * This is used by the save() method
   */
  setData: function(blockData) {
    SirTrevor.log("Setting data for block " + this.blockID);
    _.extend(this.blockStorage.data, blockData || {});
  },

  setAndLoadData: function(blockData) {
    this.setData(blockData);
    this.beforeLoadingData();
  },

  _serializeData: function() {},
  loadData: function() {},

  beforeLoadingData: function() {
    SirTrevor.log("loadData for " + this.blockID);
    SirTrevor.EventBus.trigger("block:loadData", this.blockID);
    this.loadData(this.getData());
  },

  _loadData: function() {
    SirTrevor.log("_loadData is deprecated and will be removed in the future. Please use beforeLoadingData instead.");
    this.beforeLoadingData();
  },

  checkAndLoadData: function() {
    if (!_.isEmpty(this._getData())) {
      this.beforeLoadingData();
    }
  }

};
