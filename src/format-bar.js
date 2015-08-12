"use strict";

/**
 * Format Bar
 * --
 * Displayed on focus on a text area.
 * Renders with all available options for the editor instance
 */

var _ = require('./lodash');

var config = require('./config');

var Dom = require('./packages/dom');
var Events = require('./packages/events');

var FormatBar = function(options, mediator, editor) {
  this.editor = editor;
  this.options = Object.assign({}, config.defaults.formatBar, options || {});
  this.commands = this.options.commands;
  this.mediator = mediator;

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
    this.btns = [];

    this.commands.forEach(function(format) {
      var btn = Dom.createElement("button", {
        'class': 'st-format-btn st-format-btn--' + format.name + ' ' +
          (format.iconName ? 'st-icon' : ''),
        'text': format.text,
        'data-cmd': format.cmd
      });

      this.btns.push(btn);
      this.el.appendChild(btn);
    }, this);
  },

  hide: function() {
    this.el.classList.remove('st-format-bar--is-ready');
    Dom.remove(this.el);
  },

  show: function() {
    this.editor.outer.appendChild(this.el);
    this.el.classList.add('st-format-bar--is-ready');
    Events.delegate(this.el, '.st-format-btn', 'click', this.onFormatButtonClick);
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
    var block = this.editor.getBlockFromCurrentWindowSelection();
    this.btns.forEach(function(btn) {
      var cmd = btn.getAttribute('data-cmd');
      btn.classList.toggle("st-format-btn--is-active",
                      block.queryTextBlockCommandState(cmd));
    }, this);
  },

  onFormatButtonClick: function(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var block = this.editor.getBlockFromCurrentWindowSelection();
    if (_.isUndefined(block)) {
      throw "Associated block not found";
    }

    var btn = ev.target,
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
