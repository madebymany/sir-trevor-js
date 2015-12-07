"use strict";

var _ = require('./lodash');
var Dom = require('./packages/dom');

var ErrorHandler = function(wrapper, mediator, container) {
  this.wrapper = wrapper;
  this.mediator = mediator;
  this.el = container;
  
  if (_.isUndefined(this.el)) {
    this._ensureElement();
    this.wrapper.insertBefore(this.el, this.wrapper.firstChild);
  }

  Dom.hide(this.el);

  this._bindFunctions();
  this._bindMediatedEvents();

  this.initialize();
};

Object.assign(ErrorHandler.prototype, require('./function-bind'), require('./mediated-events'), require('./renderable'), {

  errors: [],
  className: "st-errors",
  eventNamespace: 'errors',

  mediatedEvents: {
    'reset': 'reset',
    'add': 'addMessage',
    'render': 'render'
  },

  initialize: function() {
    var list = document.createElement("ul");
    var p = document.createElement("p");
    p.innerHTML = i18n.t("errors:title");

    this.el.appendChild(p)
    .appendChild(list);
    this.list = list;
  },

  render: function() {
    if (this.errors.length === 0) { return false; }
    this.errors.forEach(this.createErrorItem, this);
    Dom.show(this.el);
  },

  createErrorItem: function(errorObj) {
    var error = document.createElement("li");
    error.classList.add("st-errors__msg");
    error.innerHTML = errorObj.text;
    this.list.appendChild(error);
  },

  addMessage: function(error) {
    this.errors.push(error);
  },

  reset: function() {
    if (this.errors.length === 0) { return false; }
    this.errors = [];
    this.list.innerHTML = '';
    Dom.hide(this.el);
  }

});

module.exports = ErrorHandler;

