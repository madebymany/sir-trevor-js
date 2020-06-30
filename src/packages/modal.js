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
          '<h2 class="st-modal__title" id="<%= id %>-title"></h2>',
          '<a class="st-modal__close" aria-label="Close modal" data-micromodal-close></a>',
        '</header>',
        '<main class="st-modal__content" id="<%= id %>-content"></main>',
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

    if (!this.el) {
      var element = _.template(template, { id: this.id });
      element = Dom.createElementFromString(element);
      document.body.appendChild(element);
      this.el = element;
    }

    this.elTitle = document.getElementById(`${this.id}-title`);
    this.elContent = document.getElementById(`${this.id}-content`);
    this.form = this.el.querySelector('form');
    this.form.addEventListener('submit', event => this.onSubmit(event));

    MicroModal.init();
  },

  onSubmit: function(event) {
    if (this.callback) {
      this.submit();
    }

    event.preventDefault();
    return false;
  },

  submit: function() {
    if (this.callback(this)) {
      this.hide();
    }
  },

  show: function(args, callback) {
    this.callback = callback;
    this.elTitle.innerText = args.title;
    this.elContent.innerHTML = args.content
    MicroModal.show(this.id);
  },

  hide: function() {
    this.callback = null;
    this.el.querySelector('form').reset();
    MicroModal.close(this.id);
  },

  remove: function() {
    this.callback = null;
    MicroModal.close(this.id);
    Dom.remove(this.el);
  },

});

module.exports = Modal;
