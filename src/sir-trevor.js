(function ($, _){
  
  var root = this,
      SirTrevor;
   
  SirTrevor = root.SirTrevor = {}; 
   
  /* 
   Define default attributes that can be extended through an object passed to the
   initialize function of SirTrevor
  */
  
  SirTrevor.DEFAULTS = {
    
    baseCSSClass: "sir-trevor",
    blockStore: {
      data: []
    },
    defaultType: "TextBlock",
    spinner: {
      className: 'spinner',
      lines: 9, 
      length: 6, 
      width: 2, 
      radius: 5, 
      color: '#000', 
      speed: 1.4, 
      trail: 57, 
      shadow: false
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
    uploadUrl: '/attachments',
    baseImageUrl: '/sir-trevor-uploads/'
  }; 
  
  SirTrevor.BlockTypes = {};
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
  //= block-type.js
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
      form.bind('submit', this.onFormSubmit);
      formBound = true;
    }
  };
  
  SirTrevor.onFormSubmit = function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    // Loop through all of our instances and do our form submits on them
    _.each(SirTrevor.instances, function(inst, i) {
      inst.onFormSubmit();
    });
    return false;
  };

}(jQuery, _));

