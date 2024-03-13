"use strict";

/*
 * Sir Trevor Editor
 * --
 * Represents one Sir Trevor editor instance (with multiple blocks)
 * Each block references this instance.
 * BlockTypes are global however.
 */

var _ = require('./lodash');
var config = require('./config');
var utils = require('./utils');
var Dom = require('./packages/dom');

var Events = require('./events');
var EventBus = require('./event-bus');
var FormEvents = require('./form-events');
var BlockControls = require('./block-controls');
var BlockAddition = require('./block-addition');
var BlockAdditionTop = require('./block-addition-top');
var BlockManager = require('./block-manager');
var FormatBar = require('./format-bar');
var EditorStore = require('./extensions/editor-store');
var ErrorHandler = require('./error-handler');
var BlockPositionerSelect = require('./block-positioner-select');
var SelectionHandler = require('./selection-handler');

var Editor = function(options) {
  this.initialize(options);
};

Object.assign(Editor.prototype, require('./function-bind'), require('./events'), {

  bound: ['onFormSubmit', 'hideAllTheThings', 'changeBlockPosition',
    'removeBlockDragOver',
    'blockLimitReached', 'blockOrderUpdated', 'onBlockCountChange',
    'renderBlockPositionerSelect'],

  events: {
    'block:reorder:dragend': 'removeBlockDragOver',
    'block:reorder:dropped': 'removeBlockDragOver',
    'block:content:dropped': 'removeBlockDragOver'
  },

  initialize: function(options) {
    utils.log("Init SirTrevor.Editor");

    this.options = Object.assign({}, config.defaults, options || {});
    this.ID = _.uniqueId('st-editor-');

    if (!this._ensureAndSetElements()) { return false; }

    if(!_.isUndefined(this.options.onEditorRender) &&
       _.isFunction(this.options.onEditorRender)) {
      this.onEditorRender = this.options.onEditorRender;
    }

    // Mediated events for *this* Editor instance
    this.mediator = Object.assign({}, Events);

    this._bindFunctions();

    config.instances.push(this);

    this.build();

    FormEvents.bindFormSubmit(this.form);
  },

  /*
   * Build the Editor instance.
   * Check to see if we've been passed JSON already, and if not try and
   * create a default block.
   * If we have JSON then we need to build all of our blocks from this.
   */
  build: function() {
    Dom.hide(this.el);

    this.errorHandler = new ErrorHandler(this.outer, this.mediator, this.options.errorsContainer);
    this.store = new EditorStore(this.el.value, this.mediator);

    this.blockManager = new BlockManager(this);
    this.blockAddition = BlockAddition.create(this);
    this.BlockAdditionTop = BlockAdditionTop.create(this);
    this.blockControls = BlockControls.create(this);
    this.blockPositionerSelect = new BlockPositionerSelect(this.mediator);
    this.selectionHandler = new SelectionHandler(this.outer, this.mediator, this);
    this.formatBar = new FormatBar(this.options.formatBar, this.mediator, this);

    this.mediator.on('block:changePosition', this.changeBlockPosition);
    this.mediator.on('block:limitReached', this.blockLimitReached);

    // Apply specific classes when block order is updated
    this.mediator.on('block:rerender', this.blockOrderUpdated);
    this.mediator.on('block:create', this.blockOrderUpdated);
    this.mediator.on('block:remove', this.blockOrderUpdated);
    this.mediator.on('block:replace', this.blockOrderUpdated);
    this.mediator.on("block:countUpdate", this.onBlockCountChange);
    this.mediator.on("block-positioner-select:render", this.renderBlockPositionerSelect);

    this.dataStore = "Please use store.retrieve();";

    this._setEvents();

    // External event listeners
    window.addEventListener('click', this.hideAllTheThings);

    this.createBlocks();
    this.wrapper.classList.add('st-ready');

    if(!_.isUndefined(this.onEditorRender)) {
      this.onEditorRender();
    }
  },

  createBlocks: function() {
    var store = this.store.retrieve();

    if (store.data.length > 0) {
      store.data.forEach(function(block) {
        this.mediator.trigger('block:create', block.type, block.data);
      }, this);
    } else if (this.options.defaultType !== false) {
      this.mediator.trigger('block:create', this.options.defaultType, {});
    }

    if (this.options.focusOnInit) {
      var blockElement = this.wrapper.querySelectorAll('.st-block')[0];

      if (blockElement) {
        var block = this.blockManager.findBlockById(blockElement.getAttribute('id'));
        block.focus();
      }
    }
  },

  destroy: function() {
    // Destroy the rendered sub views
    this.formatBar.destroy();
    this.blockAddition.destroy();
    this.blockControls.destroy();

    // Destroy all blocks
    this.blockManager.blocks.forEach(function(block) {
      this.mediator.trigger('block:remove', block.blockID);
    }, this);

    // Stop listening to events
    this.mediator.stopListening();
    this.stopListening();

    // Remove instance
    config.instances = config.instances.filter(function(instance) {
      return instance.ID !== this.ID;
    }, this);

    // Remove external event listeners
    window.removeEventListener('click', this.hideAllTheThings);

    // Clear the store
    this.store.reset();
    Dom.replaceWith(this.outer, this.el);
  },

  getData: function() {
    this.onFormSubmit();
    return this.store.retrieve();
  },

  reinitialize: function(options) {
    this.destroy();
    this.initialize(options || this.options);
  },

  restore: function(data) {
    this.el.value = data;
    this.reinitialize();
  },

  blockLimitReached: function(toggle) {
    this.wrapper.classList.toggle('st--block-limit-reached', toggle);
  },

  blockOrderUpdated: function() {
    // Detect first block and decide whether to hide top controls
    var blockElement = this.wrapper.querySelectorAll('.st-block')[0];
    var hideTopControls = false;

    if (blockElement) {
      var block = this.blockManager.findBlockById(
        blockElement.getAttribute('id')
      );
      hideTopControls = block && block.textable;
    }

    this._toggleHideTopControls(hideTopControls);
  },

  _toggleHideTopControls: function(toggle) {
    this.wrapper.classList.toggle('st--hide-top-controls', toggle);
  },

  onBlockCountChange: function(new_count) {
    this.blockPositionerSelect.onBlockCountChange(new_count);
  },

  renderBlockPositionerSelect: function(positioner) {
    this.blockPositionerSelect.renderInBlock(positioner);
  },

  _setEvents: function() {
    Object.keys(this.events).forEach(function(type) {
      EventBus.on(type, this[this.events[type]], this);
    }, this);
  },

  hideAllTheThings: function(e) {
    this.blockControls.hide();
    this.blockAddition.hide();

    if (document.activeElement.getAttribute('contenteditable') === null) {
      this.formatBar.hide();
    }

    var popupSelectors = '.st-block__ui-delete-controls';
    Array.prototype.forEach.call(this.wrapper.querySelectorAll(popupSelectors), function(el) {
      el.classList.remove('active');
    });
  },

  store: function(method, options){
    utils.log("The store method has been removed, please call store[methodName]");
    return this.store[method].call(this, options || {});
  },

  removeBlockDragOver: function() {
    var dragOver = this.outer.querySelector('.st-drag-over');
    if (!dragOver) { return; }
    dragOver.classList.remove('st-drag-over');
  },

  changeBlockPosition: function(block, selectedPosition) {
    selectedPosition = selectedPosition - 1;

    var blockPosition = this.blockManager.getBlockPosition(block),
    blockBy = this.wrapper.querySelectorAll('.st-block')[selectedPosition];

    if(blockBy && blockBy.getAttribute('id') !== block.getAttribute('id')) {
      this.hideAllTheThings();
      if (blockPosition > selectedPosition) {
        blockBy.parentNode.insertBefore(block, blockBy);
      } else {
        Dom.insertAfter(block, blockBy);
      }
    }
  },

  /*
   * Handle a form submission of this Editor instance.
   * Validate all of our blocks, and serialise all data onto the JSON objects
   */
  onFormSubmit: function(shouldValidate) {
    // if undefined or null or anything other than false - treat as true
    shouldValidate = (shouldValidate === false) ? false : true;

    utils.log("Handling form submission for Editor " + this.ID);

    this.mediator.trigger('errors:reset');
    this.store.reset();

    this.validateBlocks(shouldValidate);
    this.blockManager.validateBlockTypesExist(shouldValidate);

    this.mediator.trigger('errors:render');
    this.el.value = this.store.toString();

    return this.errorHandler.errors.length;
  },

  /*
   * Call `validateAndSaveBlock` on each block found in the dom.
   */

  validateBlocks: function(shouldValidate) {
    Array.prototype.forEach.call(this.wrapper.querySelectorAll('.st-block'), (block, idx) => {
      var _block = this.blockManager.findBlockById(block.getAttribute('id'));
      if (!_.isUndefined(_block)) {
        this.validateAndSaveBlock(_block, shouldValidate);
      }
    });
  },

  /*
   * If block should be validated and is not valid then register an error.
   * Empty text blocks should be ignored.
   * Save any other valid blocks to the editor data store.
   */

  validateAndSaveBlock: function(block, shouldValidate) {
    if (!config.skipValidation && shouldValidate && !block.valid()) {
      this.mediator.trigger('errors:add', { text: _.result(block, 'validationFailMsg') });
      utils.log("Block " + block.blockID + " failed validation");
      return;
    }

    if (block.type === 'text' && block.isEmpty()) {
      return;
    }

    var blockData = block.getData();
    utils.log("Adding data for block " + block.blockID + " to block store:",
              blockData);
    this.store.addData(blockData);
  },

  findBlockById: function(block_id) {
    return this.blockManager.findBlockById(block_id);
  },

  getBlocksByType: function(block_type) {
    return this.blockManager.getBlocksByType(block_type);
  },

  getBlocksByIDs: function(block_ids) {
    return this.blockManager.getBlocksByIDs(block_ids);
  },

  getBlockPosition: function(block) {
    utils.log("This method has been moved to blockManager.getBlockPosition()");
    return this.blockManager.getBlockPosition(block);
  },

  getBlocks: function() {
    return [].map.call(this.wrapper.querySelectorAll('.st-block'), (blockEl) => {
      return this.findBlockById(blockEl.getAttribute('id'));
    });
  },

  /*
   * Set all dom elements required for the editor.
   */

  _ensureAndSetElements: function() {
    if(_.isUndefined(this.options.el)) {
      utils.log("You must provide an el");
      return false;
    }

    this.el = this.options.el;
    this.form = Dom.getClosest(this.el, 'form');

    var outer = Dom.createElement("div", {
                  'id': this.ID,
                  'class': 'st-outer notranslate',
                  'dropzone': 'copy link move'});

    var wrapper = Dom.createElement("div", { 'class': 'st-blocks' });

    // Wrap our element in lots of containers *eww*

    Dom.wrap(Dom.wrap(this.el, outer), wrapper);

    this.outer = this.form.querySelector('#' + this.ID);
    this.wrapper = this.outer.querySelector('.st-blocks');

    return true;
  }
});

module.exports = Editor;
