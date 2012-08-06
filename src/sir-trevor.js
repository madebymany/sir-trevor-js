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
      
  
  SirTrevor.options = {};
  SirTrevor.Blocks = {};
  SirTrevor.Formatters = {};
  
  //= vendor/pubsub.js
  //= vendor/spin.min.js
  //= blocks/block.js
  //= formatters/format.js
  
  /* Blocks */
  //= blocks/text-block.js
  //= blocks/block-quote.js
  //= blocks/unordered-list.js
  
  /* Formatters */
  //= formatters/base.js
  
  /* Initialize */
  
  SirTrevor.initialize = function(options) {
   this.options = _.extend({}, DEFAULTS, options || {});
  };
  
  
  
}(jQuery, _));

