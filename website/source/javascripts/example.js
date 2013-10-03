//= require underscore/underscore
//= require Eventable/eventable
//= require sir-trevor-js/sir-trevor

$(function(){
  new SirTrevor.Editor({
    el: $(".js-sir-trevor-instance"),
    blockTypes: ["Text", "List", "Video", "Quote", "Iframe"]
  });
});