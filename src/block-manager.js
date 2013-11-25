SirTrevor.BlockManager = (function(){

  var BlockManager = function(options, editorInstance, mediator) {
    this.options = options;
    this.instance_scope = editorInstance;
    this.mediator = mediator;

    this._setBlocksTypes();
    this._setRequired();
    this._bindMediatedEvents();

    this.initialize();
  };

  _.extend(BlockManager.prototype, FunctionBind, MediatedEvents, SirTrevor.Events, {

    blocks: [],
    blockCounts: {},
    blockTypes: {},

    eventNamespace: 'block',

    mediatedEvents: {
      'create': 'createBlock',
      'remove': 'removeBlock',
      'rerender': 'rerenderBlock'
    },

    initialize: function() {},

    createBlock: function(type, data) {
      type = _.classify(type);

      // Run validations
      if (!this.canCreateBlock(type)) { return; }

      var block = new SirTrevor.Blocks[type](data, this.instance_scope, this.mediator);
      this.blocks.push(block);

      this._incrementBlockTypeCount(type);
      this.mediator.trigger('block:render', block);

      this.triggerBlockCountUpdate();
      this.mediator.trigger('block:limitReached', this.blockLimitReached());

      SirTrevor.log("Block created of type " + type);
    },

    removeBlock: function(blockID) {
      var block = this.findBlockById(blockID),
          type = _.classify(block.type);

      this.mediator.trigger('block-controls:reset');
      this.blocks = _.reject(this.blocks, function(item){
                             return (item.blockID == block.blockID); });

      this._decrementBlockTypeCount(type);
      this.triggerBlockCountUpdate();
      this.mediator.trigger('block:limitReached', this.blockLimitReached());

      SirTrevor.EventBus.trigger("block:remove");
    },

    rerenderBlock: function(blockID) {
      var block = this.findBlockById(blockID);
      if (!_.isUndefined(block) && !block.isEmpty() &&
          block.drop_options.re_render_on_reorder) {
        block.beforeLoadingData();
      }
    },

    triggerBlockCountUpdate: function() {
      this.mediator.trigger('block:countUpdate', this.blocks.length);
    },

    canCreateBlock: function(type) {
      if(this.blockLimitReached()) {
        SirTrevor.log("Cannot add any more blocks. Limit reached.");
        return false;
      }

      if (!this.isBlockTypeAvailable(type)) {
        SirTrevor.log("Block type not available " + type);
        return false;
      }

      // Can we have another one of these blocks?
      if (!this.canAddBlockType(type)) {
        SirTrevor.log("Block Limit reached for type " + type);
        return false;
      }

      return true;
    },

    findBlockById: function(blockID) {
      return _.find(this.blocks, function(b){ return b.blockID == blockID; });
    },

    getBlocksByType: function(type) {
      return _.filter(this.blocks, function(b){ return _.classify(b.type) == type; });
    },

    getBlocksByIDs: function(block_ids) {
      return _.filter(this.blocks, function(b){ return _.contains(block_ids, b.blockID); });
    },

    blockLimitReached: function() {
      return (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit);
    },

    isBlockTypeAvailable: function(t) {
      return !_.isUndefined(this.blockTypes[t]);
    },

    canAddBlockType: function(type) {
      var block_type_limit = this._getBlockTypeLimit(type);
      return !(block_type_limit !== 0 && this._getBlockTypeCount(type) >= block_type_limit);
    },

    _setBlocksTypes: function() {
      this.blockTypes = _.flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.Blocks : this.options.blockTypes);
    },

    _setRequired: function() {
      this.required = false;

      if (_.isArray(this.options.required) && !_.isEmpty(this.options.required)) {
        this.required = this.options.required;
      }
    },

    _incrementBlockTypeCount: function(type) {
      this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 1: this.blockCounts[type] + 1;
    },

    _decrementBlockTypeCount: function(type) {
      this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 1: this.blockCounts[type] - 1;
    },

    _getBlockTypeCount: function(type) {
      return (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type];
    },

    _blockLimitReached: function() {
      return (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit);
    },

    _getBlockTypeLimit: function(t) {
      if (!this.isBlockTypeAvailable(t)) { return 0; }
      return parseInt((_.isUndefined(this.options.blockTypeLimits[t])) ? 0 : this.options.blockTypeLimits[t], 10);
    }

  });

  return BlockManager;

})();