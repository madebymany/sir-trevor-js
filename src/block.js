"use strict";

var _ = require('./lodash');

var config = require('./config');
var utils = require('./utils');
var Dom = require('./packages/dom');
var Events = require('./packages/events');
var BlockMixins = require('./block_mixins');

var SimpleBlock = require('./simple-block');
var BlockReorder = require('./block-reorder');
var BlockDeletion = require('./block-deletion');
var BlockPositioner = require('./block-positioner');
var EventBus = require('./event-bus');

var Spinner = require('spin.js');

const DELETE_TEMPLATE = require("./templates/delete");

var Block = function(data, instance_id, mediator, options) {
  SimpleBlock.apply(this, arguments);
};

Block.prototype = Object.create(SimpleBlock.prototype);
Block.prototype.constructor = Block;

Object.assign(Block.prototype, SimpleBlock.fn, require('./block-validations'), {

  bound: [
    "_onFocus", "_onBlur",
    "onDrop", "onDeleteClick",
    "onBlockRender", "onDeleteConfirm"
  ],

  className: 'st-block',

  attributes: function() {
    return Object.assign(SimpleBlock.fn.attributes.call(this));
  },

  icon_name: 'default',

  validationFailMsg: function() {
    return i18n.t('errors:validation_fail', { type: this.title });
  },

  editorHTML: "<div class=\"st-block__editor\"></div>",

  toolbarEnabled: true,

  availableMixins: ['droppable', 'pastable', 'uploadable', 'fetchable',
    'ajaxable', 'controllable', 'primitives'],

  droppable: false,
  pastable: false,
  uploadable: false,
  fetchable: false,
  ajaxable: false,

  // Build blocks from primitives
  primitives: true,
  
  drop_options: {},
  paste_options: {},
  upload_options: {},

  initialize: function() {},

  toMarkdown: function(markdown){ return markdown; },
  toHTML: function(html){ return html; },

  withMixin: function(mixin) {
    if (!_.isObject(mixin)) { return; }

    var initializeMethod = "initialize" + mixin.mixinName;

    if (_.isUndefined(this[initializeMethod])) {
      Object.assign(this, mixin);
      this[initializeMethod]();
    }
  },

  render: function() {
    this.beforeBlockRender();
    this._setBlockInner();

    this.editor = this.inner.children[0];
    
    this.mixinsRequireInputs = false;
    this.availableMixins.forEach(function(mixin) {
      if (this[mixin]) {
        var blockMixin = BlockMixins[utils.classify(mixin)];
        if (!_.isUndefined(blockMixin.requireInputs) && blockMixin.requireInputs) {
          this.mixinsRequireInputs = true;
        }
      }
    }, this);

    if(this.mixinsRequireInputs) {
      var input_html = document.createElement("div");
      input_html.classList.add('st-block__inputs');
      this.inner.appendChild(input_html);
      this.inputs = input_html;
    }

    this.availableMixins.forEach(function(mixin) {
      if (this[mixin]) {
        this.withMixin(BlockMixins[utils.classify(mixin)]);
      }
    }, this);

    this._blockPrepare();

    return this;
  },

  remove: function() {
    if (this.ajaxable) {
      this.resolveAllInQueue();
    }

    Dom.remove(this.el);
  },

  loading: function() {
    if(!_.isUndefined(this.spinner)) { this.ready(); }

    this.spinner = new Spinner(config.defaults.spinner);
    this.spinner.spin(this.el);

    this.el.classList.add('st--is-loading');
  },

  ready: function() {
    this.el.classList.remove('st--is-loading');
    if (!_.isUndefined(this.spinner)) {
      this.spinner.stop();
      delete this.spinner;
    }
  },

   //Generic _serializeData implementation to serialize the block into a plain object.
   //Can be overwritten, although hopefully this will cover most situations.
   //If you want to get the data of your block use block.getBlockData()
  _serializeData: function() {
    utils.log("toData for " + this.blockID);

    var data = {};

    data = Object.assign({}, data, this.savePrimitiveFields());

    // Add any inputs to the data attr
    var matcher = [
      'input:not([class="st-paste-block"])',
      'textarea:not([class="st-paste-block"])',
      'select:not([class="st-paste-block"])',
      'button:not([class="st-paste-block"])'
    ].join(",");
    if (this.$(matcher).length > 0) {
      Array.prototype.forEach.call(this.$('input, textarea, select, button'), function(input) {
        if (input.getAttribute('name')) {
          data[input.getAttribute('name')] = input.value;
        }
      });
    }

    return data;
  },

  /* Generic implementation to tell us when the block is active */
  focus: function() {
    this.focusPrimitiveFields();
  },

  blur: function() {
    this.blurPrimitiveFields();
  },

  onFocus: function() {
    this.getTextBlock().bind('focus', this._onFocus);
  },

  onBlur: function() {
    this.getTextBlock().bind('blur', this._onBlur);
  },

  /*
   * Event handlers
   */

  _onFocus: function() {
    this.trigger('blockFocus', this.el);
  },

  _onBlur: function() {},

  onBlockRender: function() {
    this.focus();
  },

  onDrop: function(dataTransferObj) {},

  onDeleteConfirm: function(e) {
    e.preventDefault();
    this.mediator.trigger('block:remove', this.blockID);
    this.remove();
  },

  // REFACTOR: have one set of delete controls that moves around like the 
  // block controls?
  addDeleteControls: function(){

    var onDeleteDeny = (e) => {
      e.preventDefault();
      this.deleteEl.classList.remove("active");
    };

    this.ui.insertAdjacentHTML("beforeend", DELETE_TEMPLATE);
    Events.delegate(this.el, ".js-st-block-confirm-delete", "click", this.onDeleteConfirm);
    Events.delegate(this.el, ".js-st-block-deny-delete", "click", onDeleteDeny);
  },

  onDeleteClick: function(ev) {
    ev.preventDefault();

    if (this.isEmpty()) {
      this.onDeleteConfirm.call(this, new Event('click'));
      return;
    }

    this.deleteEl = this.el.querySelector('.st-block__ui-delete-controls');
    this.deleteEl.classList.toggle('active');
  },

  beforeLoadingData: function() {
    this.loading();

    if(this.mixinsRequireInputs) {
      Dom.show(this.editor);
      Dom.hide(this.inputs);
    }

    SimpleBlock.fn.beforeLoadingData.call(this);

    this.ready();
  },

  _getBlockClass: function() {
    return 'st-block--' + this.className;
  },

   //Init functions for adding functionality
  _initUIComponents: function() {

    this.addDeleteControls();

    var positioner = new BlockPositioner(this.el, this.mediator);

    this._withUIComponent(positioner, '.st-block-ui-btn__reorder',
                          positioner.toggle);

    this._withUIComponent(new BlockReorder(this.el, this.mediator));

    this._withUIComponent(new BlockDeletion(), '.st-block-ui-btn__delete',
                          this.onDeleteClick);
  },

  isEmpty: function() {
    return _.isEmpty(this.getBlockData());
  }

});

Block.extend = require('./helpers/extend'); // Allow our Block to be extended.

module.exports = Block;
