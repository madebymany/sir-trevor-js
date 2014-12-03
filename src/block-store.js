"use strict";

var _ = require('./lodash');
var utils = require('./utils');

var EventBus = require('./event-bus');

module.exports = {

  /**
   * Internal storage object for the block
   */
  blockStorage: {},

  /**
   * Initialize the store, including the block type
   */
  createStore: function(blockData) {
    this.blockStorage = {
      type: utils.underscored(this.type),
      data: blockData || {}
    };
  },

  /**
   * Serialize the block and save the data into the store
   */
  save: function() {
    var data = this._serializeData();

    if (!_.isEmpty(data)) {
      this.setData(data);
    }
  },

  getData: function() {
    this.save();
    return this.blockStorage;
  },

  getBlockData: function() {
    this.save();
    return this.blockStorage.data;
  },

  _getData: function() {
    return this.blockStorage.data;
  },

  /**
   * Set the block data.
   * This is used by the save() method.
   */
  setData: function(blockData) {
    utils.log("Setting data for block " + this.blockID);
    Object.assign(this.blockStorage.data, blockData || {});
  },

  setAndLoadData: function(blockData) {
    this.setData(blockData);
    this.beforeLoadingData();
  },

  _serializeData: function() {},
  loadData: function() {},

  beforeLoadingData: function() {
    utils.log("loadData for " + this.blockID);
    EventBus.trigger("editor/block/loadData");
    this.loadData(this._getData());
  },

  _loadData: function() {
    utils.log("_loadData is deprecated and will be removed in the future. Please use beforeLoadingData instead.");
    this.beforeLoadingData();
  },

  checkAndLoadData: function() {
    if (!_.isEmpty(this._getData())) {
      this.beforeLoadingData();
    }
  }

};
