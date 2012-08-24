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
      this.setSubmitButton(null, "Please wait...");
      this._disableSubmitButton();
    }
  },
  
  onUploadStop: function(e) {
    this.globalUploadCount = (this.globalUploadCount <= 0) ? 0 : this.globalUploadCount - 1;
    
    SirTrevor.log('onUploadStop called ' + this.globalUploadCount);
    
    if(this.globalUploadCount === 0) {
      this._enableSubmitButton();
      this.resetSubmitButton();
    }
  },
  
  onError: function(e){
    SirTrevor.log('onError called');
    this.canSubmit = false;
  },
  
  _disableSubmitButton: function(){
    this.submitBtn
      .attr('disabled', 'disabled')
      .addClass('disabled');
  },
  
  _enableSubmitButton: function(){
    this.submitBtn
      .removeAttr('disabled')
      .removeClass('disabled');
  },
  
  _bindEvents: function(){
    $.subscribe("editor/setSubmitButton", _.bind(this.setSubmitButton, this));
    $.subscribe("editor/resetSubmitButton", _.bind(this.resetSubmitButton, this));
    $.subscribe("editor/onError", _.bind(this.onError, this));
    $.subscribe("editor/onUploadStart", _.bind(this.onUploadStart, this));
    $.subscribe("editor/onUploadStop", _.bind(this.onUploadStop, this));
  }
  
});

SirTrevor.submittable = function(){
  new Submittable();
};