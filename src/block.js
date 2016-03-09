"use strict";

var _ = require('./lodash');

var ScribeInterface = require('./scribe-interface');

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
    "_handleContentPaste", "_onFocus", "_onBlur", "onDrop", "onDeleteClick",
    "clearInsertedStyles", "getSelectionForFormatter", "onBlockRender",
    "onDeleteConfirm"
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
    'ajaxable', 'controllable', 'multi_editable', 'textable'],

  droppable: false,
  pastable: false,
  uploadable: false,
  fetchable: false,
  ajaxable: false,
  multi_editable: false,
  textable: false,

  drop_options: {},
  paste_options: {},
  upload_options: {},

  formattable: true,

  _previousSelection: '',

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

    if (this.hasTextBlock()) { this._initTextBlocks(); }

    this.availableMixins.forEach(function(mixin) {
      if (this[mixin]) {
        this.withMixin(BlockMixins[utils.classify(mixin)]);
      }
    }, this);

    if (this.formattable) { this._initFormatting(); }

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

    //[> Simple to start. Add conditions later <]
    if (this.hasTextBlock()) {
      data.text = this.getTextBlockHTML();
      data.format = 'html';
    }

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

  //[> Generic implementation to tell us when the block is active <]
  focus: function() {
    Array.prototype.forEach.call(this.getTextBlock(), function(el) {
      el.focus();
    });
  },

  focusAtEnd: function() {
    this.focus();
  },

  blur: function() {
    Array.prototype.forEach.call(this.getTextBlock(), function(el) {
      el.blur();
    });
  },

  onFocus: function() {
    Array.prototype.forEach.call(this.getTextBlock(), (el) => {
      el.addEventListener('focus', this._onFocus);
    });
  },

  onBlur: function() {
    Array.prototype.forEach.call(this.getTextBlock(), (el) => {
      el.addEventListener('blur', this._onBlur);
    });
  },

  //Event handlers
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
    this.mediator.trigger('block:remove', this.blockID, {focusOnPrevious: true});
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

  execTextBlockCommand: function(cmdName) {
    if (_.isUndefined(this._scribe)) {
      throw "No Scribe instance found to send a command to";
    }

    return ScribeInterface.execTextBlockCommand(this._scribe, cmdName);
  },

  queryTextBlockCommandState: function(cmdName) {
    if (_.isUndefined(this._scribe)) {
      throw "No Scribe instance found to query command";
    }

    return ScribeInterface.queryTextBlockCommandState(this._scribe, cmdName);
  },

  _handleContentPaste: function(ev) {
    setTimeout(this.onContentPasted.bind(this, ev, ev.currentTarget), 0);
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

    this.onFocus();
    this.onBlur();
  },

  _initFormatting: function() {

    // Enable formatting keyboard input
    var block = this;

    if (!this.options.formatBar) {
      return;
    }

    this.options.formatBar.commands.forEach(function(cmd) {
      if (_.isUndefined(cmd.keyCode)) {
        return;
      }

      var ctrlDown = false;

      Events.delegate(block.el,'.st-text-block', 'keyup', function(ev) {
        if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
          ctrlDown = false;
        }
      });
      Events.delegate(block.el, '.st-text-block', 'keydown', function(ev) {
        if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
          ctrlDown = true;
        }

        if(ev.which === cmd.keyCode && ctrlDown) {
          ev.preventDefault();
          block.execTextBlockCommand(cmd);
        }
      });
    });
  },

  _initTextBlocks: function() {
    Array.prototype.forEach.call(this.getTextBlock(), (el) => {
      el.addEventListener('keyup', this.getSelectionForFormatter);
      el.addEventListener('mouseup', this.getSelectionForFormatter);
      el.addEventListener('DOMNodeInserted', this.clearInsertedStyles);
    });

    var textBlock = this.getTextBlock()[0];
    if (!_.isUndefined(textBlock) && _.isUndefined(this._scribe)) {

      var configureScribe =
        _.isFunction(this.configureScribe) ? this.configureScribe.bind(this) : null;
      this._scribe = ScribeInterface.initScribeInstance(
        textBlock, this.scribeOptions, configureScribe
      );
    }
  },

  getSelectionForFormatter: function() {
    setTimeout(() => {
      var selection = window.getSelection(),
          selectionStr = selection.toString().trim(),
          en = 'formatter:' + ((selectionStr === '') ? 'hide' : 'position');

      this.mediator.trigger(en, this);
      EventBus.trigger(en, this);
    }, 1);
  },

  clearInsertedStyles: function(e) {
    var target = e.target;
    if (_.isUndefined(target.tagName)) {
      target = target.parentNode;
    }
    target.removeAttribute('style'); // Hacky fix for Chrome.
  },

  hasTextBlock: function() {
    return this.getTextBlock().length > 0;
  },

  getTextBlock: function() {
    if (_.isUndefined(this.text_block)) {
      this.text_block = this.$('.st-text-block');
    }

    return this.text_block;
  },

  getTextBlockHTML: function() {
    return this._scribe.getContent();
  },

  setTextBlockHTML: function(html) {
    var returnVal = this._scribe.setContent(html);

    // Remove any whitespace in the first node, otherwise selections won't work.
    var firstNode = this._scribe.node.firstDeepestChild(this._scribe.el);
    if (firstNode.nodeName === '#text') {
      firstNode.textContent = utils.leftTrim(firstNode.textContent);
    }

    // Remove all empty nodes at the front to get blocks working.
    while(this._scribe.el.firstChild && this._scribe.el.firstChild.textContent === '') {
      this._scribe.el.removeChild(this._scribe.el.firstChild);
    }

    // Firefox adds empty br tags at the end of content.
    while(this._scribe.el.lastChild && this._scribe.el.lastChild.nodeName === 'BR') {
      this._scribe.el.removeChild(this._scribe.el.lastChild);
    }

    return returnVal;
  },

  isEmpty: function() {
    return _.isEmpty(this.getBlockData());
  }

});

Block.extend = require('./helpers/extend'); // Allow our Block to be extended.

module.exports = Block;
