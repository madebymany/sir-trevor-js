var SirTrevor = require("sir-trevor-js")
  , $ = require("jquery");

SirTrevor.DEBUG = true;
SirTrevor.LANGUAGE = "en";

SirTrevor.setBlockOptions("Text", {
  onBlockRender: function() {
    console.log("Text block rendered");
  }
});

window.editor = new SirTrevor.Editor({
  el: $('.sir-trevor'),
  blockTypes: [
    "Heading",
    "Text",
    "List",
    "Quote",
    "Image",
    "Video",
    "Tweet"
  ]
});

$('form').bind('submit', function(){
  return false;
});

