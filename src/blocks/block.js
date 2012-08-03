/*
  Generic Block Implementation
*/

SirTrevor.Block = function(args){
  
  args || {};
  
  var defaults = {
    toolbar: false,
    dropzone: false,
    title: "",
    limit: 0,
    editor: null,
    dropzoneDom: null,
    onInit: function(){},
    onDrop: function(){}
  };
  
  $.extend(defaults, args);
  
  console.log(defaults);

};