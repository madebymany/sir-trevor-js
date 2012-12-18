(function ($, _){
  
  var root = this,
      SirTrevor;
   
  SirTrevor = root.SirTrevor = {};
  SirTrevor.DEBUG = true;
  SirTrevor.SKIP_VALIDATION = false;
  
  /*
   Define default attributes that can be extended through an object passed to the
   initialize function of SirTrevor
  */
  
  SirTrevor.DEFAULTS = {
    baseCSSClass: "sir-trevor",
    errorClass: "error",
    defaultType: "Text",
    spinner: {
      className: 'spinner',
      lines: 9,
      length: 8,
      width: 3,
      radius: 6,
      color: '#000',
      speed: 1.4,
      trail: 57,
      shadow: false,
      left: '50%',
      top: '50%'
    },
    marker: {
      baseCSSClass: "marker",
      buttonClass: "button",
      addText: "Click to add:",
      dropText: "Drop to place content"
    },
    formatBar: {
      baseCSSClass: "formatting-control"
    },
    blockLimit: 0,
    blockTypeLimits: {},
    required: [],
    uploadUrl: '/attachments',
    baseImageUrl: '/sir-trevor-uploads/'
  };

  SirTrevor.Blocks = {};
  SirTrevor.Formatters = {};
  SirTrevor.instances = [];
  
  var formBound = false; // Flag to tell us once we've bound our submit event
  
  /* Generic function binding utility, used by lots of our classes */
  var FunctionBind = {
    bound: [],
    _bindFunctions: function(){
      var args = [];
      args.push(this);
      args.join(this.bound);
      _.bindAll.apply(this, args);
    }
  };
  
  //= helpers
  //= vendor
  //= extensions
  //= block.js
  //= formatter.js
  
  /* Default Blocks */
  //= blocks
  /* Default Formatters */
  //= formatters
  /* Marker */
  //= marker.js
  /* FormatBar */
  //= format-bar.js
  //= sir-trevor-editor.js

  /* We need a form handler here to handle all the form submits */
  
  SirTrevor.bindFormSubmit = function(form) {
    if (!formBound) {
      SirTrevor.submittable();
      form.bind('submit', this.onFormSubmit);
      formBound = true;
    }
  };
  
  SirTrevor.onBeforeSubmit = function(should_validate) {
    // Loop through all of our instances and do our form submits on them
    var errors = 0;
    _.each(SirTrevor.instances, function(inst, i) {
      errors += inst.onFormSubmit(should_validate);
    });
    SirTrevor.log("Total errors: " + errors);
    
    return errors;
  };
  
  SirTrevor.onFormSubmit = function(ev) {
    var errors = SirTrevor.onBeforeSubmit();
    
    if(errors > 0) {
      SirTrevor.publish("onError");
      ev.preventDefault();
    }
  };
  
  SirTrevor.runOnAllInstances = function(method) {
    if (_.has(SirTrevor.Editor.prototype, method)) {
      // augment the arguments pseudo array and pass on to invoke()
      // this allows us to pass arguments on to the target methods
      [].unshift.call(arguments, SirTrevor.instances);
      _.invoke.apply(_, arguments);
    } else {
      SirTrevor.log("method doesn't exist");
    }
  };
  
}(jQuery, _));

