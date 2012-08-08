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
      lines: 9, 
      length: 3, 
      width: 2, 
      radius: 3, 
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
    formatBar: {}
  }; 
  
  SirTrevor.BlockTypes = {};
  SirTrevor.Formatters = {};
  
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

}(jQuery, _));

