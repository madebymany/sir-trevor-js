(function ($, _){
  
  var root = this,
      SirTrevor;
   
  SirTrevor = root.SirTrevor = {}; 
   
  /* 
   Define default attributes that can be extended through an object passed to the
   initialize function of SirTrevor
  */
  
  SirTrevor.DEFAULTS = {
    el: null,
    baseCSSClass: "sir-trevor",
    storage: "json",
    blockStore: {
      "data": []
    },
    defaultType: "TextBlock",
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

  SirTrevor.BlockTypes = {};
  SirTrevor.Formatters = {};
  
  //= helpers
  //= vendor
  //= block.js
  //= formatter.js
  
  /* Default Blocks */
  //= blocks
  /* Default Formatters */
  //= formatters
  //= sir-trevor-editor.js

}(jQuery, _));

