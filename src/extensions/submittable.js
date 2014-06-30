/*
  SirTrevor.Submittable
  --
  We need a global way of setting if the editor can and can't be submitted,
  and a way to disable the submit button and add messages (when appropriate)
  We also need this to be highly extensible so it can be overridden.
  This will be triggered *by anything* so it needs to subscribe to events.
*/

SirTrevor.Submittable = function($form){
  this.$form = $form;
  this.intialize();
};

_.extend(SirTrevor.Submittable.prototype, {

  intialize: function(){
    this.$submitBtn = this.$form.find("input[type='submit']");

    var btnTitles = [];

    _.each(this.$submitBtn, function(btn){
      btnTitles.push($(btn).attr('value'));
    });

    this.submitBtnTitles = btnTitles;
    this.canSubmit = true;
    this.globalUploadCount = 0;
    this._bindEvents();
  },

  setSubmitButton: function(e, message) {
    this.$submitBtn.attr('value', message);
  },

  resetSubmitButton: function(){
    _.each(this.$submitBtn, function(item, index){
      $(item).attr('value', this.submitBtnTitles[index]);
    }, this);
  },

  onUploadStart: function(e){
    this.globalUploadCount++;
    SirTrevor.log('onUploadStart called ' + this.globalUploadCount);

    if(this.globalUploadCount === 1) {
      this._disableSubmitButton();
    }
  },

  onUploadStop: function(e) {
    this.globalUploadCount = (this.globalUploadCount <= 0) ? 0 : this.globalUploadCount - 1;

    SirTrevor.log('onUploadStop called ' + this.globalUploadCount);

    if(this.globalUploadCount === 0) {
      this._enableSubmitButton();
    }
  },

  onError: function(e){
    SirTrevor.log('onError called');
    this.canSubmit = false;
  },

  _disableSubmitButton: function(message){
    this.setSubmitButton(null, message || i18n.t("general:wait"));
    this.$submitBtn
      .attr('disabled', 'disabled')
      .addClass('disabled');
  },

  _enableSubmitButton: function(){
    this.resetSubmitButton();
    this.$submitBtn
      .removeAttr('disabled')
      .removeClass('disabled');
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
    _.forEach(this._events, function(callback, type) {
      SirTrevor.EventBus.on(type, this[callback], this);
    }, this);
  }

});