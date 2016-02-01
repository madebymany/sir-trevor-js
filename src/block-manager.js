"use strict";

var _ = require('./lodash');
var utils = require('./utils');
var config = require('./config');

var EventBus = require('./event-bus');
var Blocks = require('./blocks');

var Dom = require("./packages/dom");

const BLOCK_OPTION_KEYS = 
  ['convertToMarkdown', 'convertFromMarkdown', 'formatBar'];

var BlockManager = function(SirTrevor) {
  this.options = SirTrevor.options;
  this.blockOptions = BLOCK_OPTION_KEYS.reduce(function(acc, key) {
    acc[key] = SirTrevor.options[key];
    return acc;
  }, {});
  this.instance_scope = SirTrevor.ID;
  this.mediator = SirTrevor.mediator;

  // REFACTOR: this is a hack until I can focus on reworking the blockmanager
  this.wrapper = SirTrevor.wrapper;

  this.blocks = [];
  this.blockCounts = {};
  this.blockTypes = [];

  this._setBlocksTypes();

  this._setRequired();
  this._bindMediatedEvents();

  this.initialize();
};

Object.assign(BlockManager.prototype, require('./function-bind'), require('./mediated-events'), require('./events'), {

  eventNamespace: 'block',

  mediatedEvents: {
    'create': 'createBlock',
    'remove': 'removeBlock',
    'rerender': 'rerenderBlock',
    'replace': 'replaceBlock',
    'focusPrevious': 'focusPreviousBlock',
    'focusNext': 'focusNextBlock'
  },

  initialize: function() {},

  createBlock: function(type, data, previousSibling) {
    type = utils.classify(type);

    // Run validations
    if (!this.canCreateBlock(type)) { return; }

    var block = new Blocks[type](data, this.instance_scope, this.mediator,
                                 this.blockOptions);
    this.blocks.push(block);

    this._incrementBlockTypeCount(type);
    this.renderBlock(block, previousSibling);

    this.triggerBlockCountUpdate();
    this.mediator.trigger('block:limitReached', this.blockLimitReached());

    EventBus.trigger(data ? "block:create:existing" : "block:create:new", block);
    utils.log("Block created of type " + type);
  },

  removeBlock: function(blockID, options) {
    options = Object.assign({
      transposeContent: false,
      focusOnPrevious: false
    }, options);

    var block = this.findBlockById(blockID);
    var type = utils.classify(block.type);
    var previousBlock = this.getPreviousBlock(block);
    var nextBlock = this.getNextBlock(block);
    
    if (options.transposeContent && block.textable) {

      // Don't allow removal of first block if it's the only block.
      if (!previousBlock && this.blocks.length === 1) { return; }

      // If previous block can transpose content then append content.
      if (previousBlock && previousBlock.textable) {
        previousBlock.appendContent(
          block.getScribeInnerContent(), {
          keepCaretPosition: true
        });
      } else {
        // If there's content and the block above isn't textable then 
        // cancel remove.
        if (block.getScribeInnerContent() !== '') {
          return;
        }

        // If block before isn't textable then we want to still focus.
        if (previousBlock) {
          previousBlock.focusAtEnd();
        } else if (nextBlock) {
          // If there wasn't a previous block then 
          // we'll want to focus on the next block.
          nextBlock.focus();
        }
      }
    }
    
    this.mediator.trigger('block-controls:reset');
    this.blocks = this.blocks.filter(function(item) {
      return (item.blockID !== block.blockID);
    });

    block.remove();

    if (options.focusOnPrevious && previousBlock) {
      previousBlock.focusAtEnd();
    }

    this._decrementBlockTypeCount(type);
    this.triggerBlockCountUpdate();
    this.mediator.trigger('block:limitReached', this.blockLimitReached());

    EventBus.trigger("block:remove");
  },

  replaceBlock: function(blockNode, type, data) {
    var block = this.findBlockById(blockNode.id);
    this.createBlock(type, data || null, blockNode);
    this.removeBlock(blockNode.id);
    block.remove();
  },

  renderBlock: function(block, previousSibling) {
    // REFACTOR: this will have to do until we're able to address 
    // the block manager
    if (previousSibling) {
      Dom.insertAfter(block.render().el, previousSibling);
    } else {
      this.wrapper.appendChild(block.render().el);
    }
    block.trigger("onRender");
  },

  rerenderBlock: function(blockID) {
    var block = this.findBlockById(blockID);
    if (!_.isUndefined(block) && !block.isEmpty() &&
        block.drop_options.re_render_on_reorder) {
      block.beforeLoadingData();
    }
  },

  getPreviousBlock: function(block) {
    var blockPosition = this.getBlockPosition(block.el);
    if (blockPosition < 1) { return; }
    var previousBlock = this.wrapper.querySelectorAll('.st-block')[blockPosition - 1];
    return this.findBlockById(
      previousBlock.getAttribute('id')
    );
  },

  getNextBlock: function(block) {
    var blockPosition = this.getBlockPosition(block.el);
    if (blockPosition < 0 || blockPosition >= this.blocks.length - 1) { return; }
    return this.findBlockById(
      this.wrapper.querySelectorAll('.st-block')[blockPosition + 1].getAttribute('id')
    );
  },

  getBlockPosition: function(block) {
    return Array.prototype.indexOf.call(this.wrapper.querySelectorAll('.st-block'), block);
  },

  focusPreviousBlock: function(blockID) {
    var block = this.findBlockById(blockID);
    
    if (block.textable) {
      var previousBlock = this.getPreviousBlock(block);

      if (previousBlock && previousBlock.textable) {
        previousBlock.focusAtEnd();
      }
    }
  },

  focusNextBlock: function(blockID) {
    var block = this.findBlockById(blockID);
    
    if (block && block.textable) {
      var nextBlock = this.getNextBlock(block);

      if (nextBlock && nextBlock.textable) {
        nextBlock.focus();
      }
    }
  },

  triggerBlockCountUpdate: function() {
    this.mediator.trigger('block:countUpdate', this.blocks.length);
  },

  canCreateBlock: function(type) {
    if(this.blockLimitReached()) {
      utils.log("Cannot add any more blocks. Limit reached.");
      return false;
    }

    if (!this.isBlockTypeAvailable(type)) {
      utils.log("Block type not available " + type);
      return false;
    }

    // Can we have another one of these blocks?
    if (!this.canAddBlockType(type)) {
      utils.log("Block Limit reached for type " + type);
      return false;
    }

    return true;
  },

  validateBlockTypesExist: function(shouldValidate) {
    if (config.skipValidation || !shouldValidate) { return false; }

    (this.required || []).forEach(function(type, index) {
      if (!this.isBlockTypeAvailable(type)) { return; }

      if (this._getBlockTypeCount(type) === 0) {
        utils.log("Failed validation on required block type " + type);
        this.mediator.trigger('errors:add',
                              { text: i18n.t("errors:type_missing", { type: type }) });

      } else {
        var blocks = this.getBlocksByType(type).filter(function(b) {
          return !b.isEmpty();
        });

        if (blocks.length > 0) { return false; }

        this.mediator.trigger('errors:add', {
          text: i18n.t("errors:required_type_empty", {type: type})
        });

        utils.log("A required block type " + type + " is empty");
      }
    }, this);
  },

  findBlockById: function(blockID) {
    return this.blocks.find(function(b) {
      return b.blockID === blockID;
    });
  },

  getBlocksByType: function(type) {
    return this.blocks.filter(function(b) {
      return utils.classify(b.type) === type;
    });
  },

  getBlocksByIDs: function(block_ids) {
    return this.blocks.filter(function(b) {
      return block_ids.includes(b.blockID);
    });
  },

  blockLimitReached: function() {
    return (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit);
  },

  isBlockTypeAvailable: function(t) {
    return this.blockTypes.includes(t);
  },

  canAddBlockType: function(type) {
    var block_type_limit = this._getBlockTypeLimit(type);
    return !(block_type_limit !== 0 && this._getBlockTypeCount(type) >= block_type_limit);
  },

  _setBlocksTypes: function() {
    this.blockTypes = this.options.blockTypes || Object.keys(Blocks);
  },

  _setRequired: function() {
    this.required = false;

    if (Array.isArray(this.options.required) && !_.isEmpty(this.options.required)) {
      this.required = this.options.required;
    }
  },

  _incrementBlockTypeCount: function(type) {
    this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 1 : this.blockCounts[type] + 1;
  },

  _decrementBlockTypeCount: function(type) {
    this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 1 : this.blockCounts[type] - 1;
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

module.exports = BlockManager;
