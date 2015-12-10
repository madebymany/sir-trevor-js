"use strict";

/**
 * Format Bar
 * --
 * Displayed on focus on a text area.
 * Renders with all available options for the editor instance
 */

var _ = require('./lodash');

var config = require('./config');
var utils = require('./utils');
var Dom = require('./packages/dom');
var Events = require('./packages/events');

const FORMAT_BUTTON_TEMPLATE = require("./templates/format-button");

var FormatBar = function(options, mediator, editor) {
  this.editor = editor;
  this.options = Object.assign({}, config.defaults.formatBar, options || {});
  this.commands = this.options.commands;
  this.mediator = mediator;
  this.isShown = false;

  this._ensureElement();
  this._bindFunctions();
  this._bindMediatedEvents();

  this.initialize.apply(this, arguments);
};

Object.assign(FormatBar.prototype, require('./function-bind'), require('./mediated-events'), require('./events'), require('./renderable'), {

  className: 'st-format-bar',

  bound: ["onFormatButtonClick", "renderBySelection", "hide"],

  eventNamespace: 'formatter',

  mediatedEvents: {
    'position': 'renderBySelection',
    'show': 'show',
    'hide': 'hide'
  },

  initialize: function() {

    var buttons = this.commands.reduce(function(memo, format) {
      return memo += FORMAT_BUTTON_TEMPLATE(format);
    }, "");

    this.el.insertAdjacentHTML("beforeend", buttons);

    Events.delegate(this.el, '.st-format-btn', 'click', this.onFormatButtonClick);
  },

  hide: function() {
    this.isShown = false;

    this.el.classList.remove('st-format-bar--is-ready');
    Dom.remove(this.el);
  },

  show: function() {
    if(this.isShown){
      return;
    }

    this.isShown = true;

    this.editor.outer.appendChild(this.el);
    this.el.classList.add('st-format-bar--is-ready');
  },

  remove: function(){ Dom.remove(this.el); },

  renderBySelection: function() {
    this.highlightSelectedButtons();
    this.show();
    this.calculatePosition();
  },

  calculatePosition: function() {
    var selection = window.getSelection(),
        range = selection.getRangeAt(0),
        boundary = range.getBoundingClientRect(),
        coords = {},
        outer = this.editor.outer,
        outerBoundary = outer.getBoundingClientRect();

    coords.top = (boundary.top - outerBoundary.top) + 'px';
    coords.left = (((boundary.left + boundary.right) / 2) -
      (this.el.offsetWidth / 2) - outerBoundary.left) + 'px';

    this.el.style.top = coords.top;
    this.el.style.left = coords.left;
  },

  highlightSelectedButtons: function() {
    var block = utils.getBlockBySelection();
    [].forEach.call(this.el.querySelectorAll(".st-format-btn"), function(btn) {
      var cmd = btn.getAttribute('data-cmd');
      btn.classList.toggle("st-format-btn--is-active",
                      block.queryTextBlockCommandState(cmd));
      btn = null;
    });
  },

  onFormatButtonClick: function(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var block = utils.getBlockBySelection();
    if (_.isUndefined(block)) {
      throw "Associated block not found";
    }

    var btn = ev.currentTarget,
        cmd = btn.getAttribute('data-cmd');

    if (_.isUndefined(cmd)) {
      return false;
    }

    block.execTextBlockCommand(cmd);

    this.highlightSelectedButtons();

    return false;
  }

});

module.exports = FormatBar;
