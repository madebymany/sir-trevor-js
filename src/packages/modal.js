"use strict";

/**
 * Modal
 * --
 * Displayed for extra options.
 */


var MicroModal = require('micromodal/lib/src/index').default;
var Dom = require("./dom");
var _ = require('../lodash');

var template = [
  '<div class="st-modal st-micromodal-slide" id="<%= id %>" aria-hidden="true">',
    '<div class="st-modal__overlay" tabindex="-1" data-micromodal-close>',
      '<form class="st-modal__container" role="dialog" aria-modal="true" aria-labelledby="<%= id %>-title" novalidate>',
        '<header class="st-modal__header">',
          '<h2 class="st-modal__title" id="<%= id %>-title"><%= args.title %></h2>',
          '<button class="st-modal__close" aria-label="Close modal" data-micromodal-close></button>',
        '</header>',
        '<main class="st-modal__content" id="<%= id %>-content"><%= args.description %></main>',
        '<footer class="st-modal__footer">',
          '<button id="<%= id %>-submit" class="st-modal__btn">',
            i18n.t("general:submit"),
          '</button>',
        '</footer>',
      '</form>',
    '</div>',
  '</div>'
].join("\n");

var Modal = function() {
  this.initialize();
};

Object.assign(Modal.prototype, {

  id: 'sirtrevor-modal',

  initialize: function() {
    this.el = document.getElementById(this.id);
    MicroModal.init();
  },

  submit: function() {
    if (this.callback(this)) {
      this.hide();
    }
  },

  show: function(args, callback) {
    this.callback = callback;
    var element = _.template(template, { id: this.id, args: args });
    element = Dom.createElementFromString(element);
    element.querySelector('form').addEventListener('submit', event => {
      this.submit();
      event.preventDefault();
    })

    if (this.el) {
      document.body.replaceChild(element, this.el)
    } else {
      document.body.appendChild(element);
    }

    this.el = element;
    MicroModal.show(this.id);
  },

  hide: function() {
    this.el.querySelector('form').reset();
    MicroModal.close(this.id);
  },

  remove: function() {
    MicroModal.close(this.id);
    Dom.remove(this.el);
  },

});

module.exports = Modal;
