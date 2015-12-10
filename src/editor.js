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
var BlockManager = require('./block-manager');
var FormatBar = require('./format-bar');
var EditorStore = require('./extensions/editor-store');
var ErrorHandler = require('./error-handler');

var Editor = function(options) {
  this.initialize(options);
};

Object.assign(Editor.prototype, require('./function-bind'), require('./events'), {

  bound: ['onFormSubmit', 'hideAllTheThings', 'changeBlockPosition',
    'removeBlockDragOver', 'blockLimitReached'],

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
    this.blockControls = BlockControls.create(this);

    this.formatBar = new FormatBar(this.options.formatBar, this.mediator, this);

    this.mediator.on('block:changePosition', this.changeBlockPosition);
    this.mediator.on('block:limitReached', this.blockLimitReached);

    this.dataStore = "Please use store.retrieve();";

    this._setEvents();

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

    // Clear the store
    this.store.reset();
    Dom.replaceWith(this.outer, this.el);
  },

  reinitialize: function(options) {
    this.destroy();
    this.initialize(options || this.options);
  },

  blockLimitReached: function(toggle) {
    this.wrapper.classList.toggle('st--block-limit-reached', toggle);
  },

  _setEvents: function() {
    Object.keys(this.events).forEach(function(type) {
      EventBus.on(type, this[this.events[type]], this);
    }, this);
  },

  hideAllTheThings: function(e) {
    this.blockControls.hide();
    this.blockAddition.hide();
    this.formatBar.hide();
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

  validateAndSaveBlock: function(block, shouldValidate) {
    if ((!config.skipValidation || shouldValidate) && !block.valid()) {
      this.mediator.trigger('errors:add', { text: _.result(block, 'validationFailMsg') });
      utils.log("Block " + block.blockID + " failed validation");
      return;
    }

    var blockData = block.getData();
    utils.log("Adding data for block " + block.blockID + " to block store:",
              blockData);
    this.store.addData(blockData);
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

  validateBlocks: function(shouldValidate) {
    var self = this;
    Array.prototype.forEach.call(this.wrapper.querySelectorAll('.st-block'), function(block, idx) {
      var _block = self.blockManager.findBlockById(block.getAttribute('id'));
      if (!_.isUndefined(_block)) {
        self.validateAndSaveBlock(_block, shouldValidate);
      }
    });
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

    var wrapper = Dom.createElement("div", {'class': 'st-blocks'});

    // Wrap our element in lots of containers *eww*

    Dom.wrap(Dom.wrap(this.el, outer), wrapper);

    this.outer = this.form.querySelector('#' + this.ID);
    this.wrapper = this.outer.querySelector('.st-blocks');

    return true;
  }

});

module.exports = Editor;


