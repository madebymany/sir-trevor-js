/* 
  SirTrevor.Submittable
  --
  We need a global way of setting if the editor can and can't be submitted,
  and a way to disable the submit button and add messages (when appropriate)
  We also need this to be highly extensible so it can be overridden.
  This will be triggered *by anything* so it needs to subscribe to events.
*/

var Submittable = function(){
  this.intialize();
};

_.extend(Submittable.prototype, {
  
  intialize: function(){
    this.submitBtn = $("input[type='submit']");
    
    var btnTitles = [];
    
    _.each(this.submitBtn, function(btn){
      btnTitles.push($(btn).attr('value'));
    });
    
    this.submitBtnTitles = btnTitles;
    this.canSubmit = true;
    this.globalUploadCount = 0;
    this._bindEvents();
  },
  
  setSubmitButton: function(e, message) {
    this.submitBtn.attr('value', message);
  },
  
  resetSubmitButton: function(){
    _.each(this.submitBtn, _.bind(function(item, index){
      $(item).attr('value', this.submitBtnTitles[index]);
    }, this));
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
    this.setSubmitButton(null, message || "Please wait...");
    this.submitBtn
      .attr('disabled', 'disabled')
      .addClass('disabled');
  },
  
  _enableSubmitButton: function(){
    this.resetSubmitButton();
    this.submitBtn
      .removeAttr('disabled')
      .removeClass('disabled');
  },
  
  _bindEvents: function(){
    SirTrevor.subscribe("disableSubmitButton", _.bind(this._disableSubmitButton, this));
    SirTrevor.subscribe("enableSubmitButton", _.bind(this._enableSubmitButton, this));
    SirTrevor.subscribe("setSubmitButton", _.bind(this.setSubmitButton, this));
    SirTrevor.subscribe("resetSubmitButton", _.bind(this.resetSubmitButton, this));
    SirTrevor.subscribe("onError", _.bind(this.onError, this));
    SirTrevor.subscribe("onUploadStart", _.bind(this.onUploadStart, this));
    SirTrevor.subscribe("onUploadStop", _.bind(this.onUploadStop, this));
  }
  
});

SirTrevor.submittable = function(){
  new Submittable();
};