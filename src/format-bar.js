"use strict";

/**
 * Format Bar
 * --
 * Displayed on focus on a text area.
 * Renders with all available options for the editor instance
 */

var _ = require('./lodash');
var $ = require('jquery');

var config = require('./config');
var utils = require('./utils');

var FormatBar = function(options, mediator, editor) {
  this.editor = editor;
  this.options = Object.assign({}, config.defaults.formatBar, options || {});
  this.commands = null;
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
    this.$b = $(document);
  },

  hide: function() {
    this.isShown = false;

    this.$el.removeClass('st-format-bar--is-ready');
    this.$el.remove();
  },

  show: function() {
    if(this.isShown){
      return;
    }

    this.isShown = true;

    this.editor.$outer.append(this.$el);
    this.$el.addClass('st-format-bar--is-ready');
    this.$el.bind('click', '.st-format-btn', this.onFormatButtonClick);
  },

  remove: function(){ this.$el.remove(); },

  renderBySelection: function() {
    var block = utils.getBlockBySelection();
    var commands = block.formatBarCommands;

    if(commands && commands.length){
      this.updateButtons(commands);
      this.highlightSelectedButtons();
      this.show();
      this.calculatePosition();
    }
  },

  calculatePosition: function() {
    var selection = window.getSelection(),
        range = selection.getRangeAt(0),
        boundary = range.getBoundingClientRect(),
        coords = {},
        outer = this.editor.$outer.get(0),
        outerBoundary = outer.getBoundingClientRect();

    var top = boundary.top;
    var left = ((boundary.left + boundary.right) / 2) - (this.el.offsetWidth / 2);
    if(left < 0){
      left = 0;
    }

    coords.top = (top - outerBoundary.top) + 'px';
    coords.left = (left - outerBoundary.left) + 'px';

    this.$el.css(coords);
  },

  updateButtons: function(commands) {

    if(this.commands !== commands){
      this.commands = commands;
      this.$btns = [];
      this.$el.empty();

      commands.forEach(function(format) {
        var btn = $("<button>", {
          'class': 'st-format-btn st-format-btn--' + format.name + ' ' +
          (format.iconName ? 'st-icon' : ''),
          'text': format.text,
          'data-cmd': format.cmd
        });

        this.$btns.push(btn);
        btn.appendTo(this.$el);
      }, this);
    }
  },

  highlightSelectedButtons: function() {
    var block = utils.getBlockBySelection();
    this.$btns.forEach(function(btn) {
      var cmd = $(btn).data('cmd');
      btn.toggleClass("st-format-btn--is-active",
                      block.queryTextBlockCommandState(cmd));
    }, this);
  },

  onFormatButtonClick: function(ev){
    ev.stopPropagation();

    var block = utils.getBlockBySelection();
    if (_.isUndefined(block)) {
      throw "Associated block not found";
    }

    var btn = $(ev.target),
        cmd = btn.data('cmd');

    if (_.isUndefined(cmd)) {
      return false;
    }

    block.execTextBlockCommand(cmd);

    this.highlightSelectedButtons();

    return false;
  }

});

module.exports = FormatBar;
