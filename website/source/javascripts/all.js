//= require jquery.typer

$(function(){
  var $typer = $('.typer-target');

  $.typer.options.highlightSpeed = 10;
  $.typer.options.typeSpeed = 75;
  $.typer.options.typeDelay = 75;

  $typer.typer();
});