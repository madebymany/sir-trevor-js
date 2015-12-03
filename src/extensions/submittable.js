"use strict";

/*
 * SirTrevor.Submittable
 * --
 * We need a global way of setting if the editor can and can't be submitted,
 * and a way to disable the submit button and add messages (when appropriate)
 * We also need this to be highly extensible so it can be overridden.
 * This will be triggered *by anything* so it needs to subscribe to events.
 */

var utils = require('../utils');

var EventBus = require('../event-bus');

var Submittable = function(form) {
  this.form = form;
  this.initialize();
};

Object.assign(Submittable.prototype, {

  initialize: function(){
    this.submitBtns = this.form.querySelectorAll("input[type='submit']");

    var btnTitles = [];

    Array.prototype.forEach.call(this.submitBtns, function(btn, i){
      btnTitles.push(btn.getAttribute('value'));
    });

    this.submitBtnTitles = btnTitles;
    this.canSubmit = true;
    this.globalUploadCount = 0;
    this._bindEvents();
  },

  setSubmitButton: function(e, message) {
    Array.prototype.forEach.call(this.submitBtns, function(btn, i){
      btn.setAttribute('value', message);
    });
  },

  resetSubmitButton: function(){
    var titles = this.submitBtnTitles;
    Array.prototype.forEach.call(this.submitBtns, function(item, index){
      item.setAttribute('value', titles[index]);
    });
  },

  onUploadStart: function(e){
    this.globalUploadCount++;
    utils.log('onUploadStart called ' + this.globalUploadCount);

    if(this.globalUploadCount === 1) {
      this._disableSubmitButton();
    }
  },

  onUploadStop: function(e) {
    this.globalUploadCount = (this.globalUploadCount <= 0) ? 0 : this.globalUploadCount - 1;

    utils.log('onUploadStop called ' + this.globalUploadCount);

    if(this.globalUploadCount === 0) {
      this._enableSubmitButton();
    }
  },

  onError: function(e){
    utils.log('onError called');
    this.canSubmit = false;
  },

  _disableSubmitButton: function(message){
    this.setSubmitButton(null, message || i18n.t("general:wait"));
    Array.prototype.forEach.call(this.submitBtns, function(btn, i){
      btn.setAttribute('disabled', 'disabled');
      btn.classList.add('disabled');
    });
  },

  _enableSubmitButton: function(){
    this.resetSubmitButton();
    Array.prototype.forEach.call(this.submitBtns, function(btn, i){
      btn.removeAttribute('disabled');
      btn.classList.remove('disabled');
    });
  },

  _events : {
    "disableSubmitButton" : "_disableSubmitButton",
    "enableSubmitButton"  : "_enableSubmitButton",
    "setSubmitButton"     : "setSubmitButton",
    "resetSubmitButton"   : "resetSubmitButton",
    "onError"             : "onError",
    "onUploadStart"       : "onUploadStart",
    "onUploadStop"        : "onUploadStop"
  },

  _bindEvents: function(){
    Object.keys(this._events).forEach(function(type) {
      EventBus.on(type, this[this._events[type]], this);
    }, this);
  }

});

module.exports = Submittable;

