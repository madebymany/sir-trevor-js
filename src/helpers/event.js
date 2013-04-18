/* Halt event execution */
function halt(ev){
  ev.preventDefault();
}

function controlKeyDown(ev){
  return (ev.which == 17 || ev.which == 224);
}

function isElementNear($element, distance, event) {
  var left = $element.offset().left - distance,
      top = $element.offset().top - distance,
      right = left + $element.width() + ( 2 * distance ),
      bottom = top + $element.height() + ( 2 * distance ),
      x = event.pageX,
      y = event.pageY;

  return ( x > left && x < right && y > top && y < bottom );
}

/*
  Drop Area Plugin from @maccman
  http://blog.alexmaccaw.com/svbtle-image-uploading
  --
  Tweaked so we use the parent class of dropzone
*/

(function($){
  function dragEnter(e) {
    halt(e);
  }

  function dragOver(e) {
    e.originalEvent.dataTransfer.dropEffect = "copy";
    $(e.currentTarget).addClass('st-drag-over');
    halt(e);
  }

  function dragLeave(e) {
    $(e.currentTarget).removeClass('st-drag-over');
    halt(e);
  }

  $.fn.dropArea = function(){
    this.bind("dragenter", dragEnter).
         bind("dragover",  dragOver).
         bind("dragleave", dragLeave);
    return this;
  };

  $.fn.noDropArea = function(){
    this.unbind("dragenter").
         unbind("dragover").
         unbind("dragleave");
    return this;
  };

})(jQuery);