(function ($, _){
  
  var root = this,
      SirTrevor;
   
  SirTrevor = root.SirTrevor = {}; 
   
  /* 
   Define default attributes that can be extended through an object passed to the
   initialize function of SirTrevor
  */
  
  var DEFAULTS = {
    baseCSSClass: "sir-trevor",
    storage: "json",
    blockStore: {
      "data": []
    },
    blockIndex: 0,
    spinner: {
      lines: 9, 
      length: 3, 
      width: 2, 
      radius: 3, 
      color: '#000', 
      speed: 1.4, 
      trail: 57, 
      shadow: false
    }
  }; 

  SirTrevor.options = DEFAULTS;
  SirTrevor.Blocks = {};
  SirTrevor.Formatters = {};
  
  //= helpers
  //= vendor
  //= block.js
  //= formatter.js
  
  /* Default Blocks */
  //= blocks
  /* Default Formatters */
  //= formatters
  
  /* Initialize */
  SirTrevor.initialize = function(options) {
   this.options = _.extend({}, DEFAULTS, options || {});
   this.build();
  };
  
  SirTrevor.build = function() {
    
  };
  
}(jQuery, _));

