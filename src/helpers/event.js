/*
  Drop Area Plugin from @maccman
  http://blog.alexmaccaw.com/svbtle-image-uploading
  --
  Tweaked so we use the parent class of dropzone
*/

(function($){
  function dragEnter(e) {
    e.preventDefault();
  }

  function dragOver(e) {
    e.originalEvent.dataTransfer.dropEffect = "copy";
    $(e.currentTarget).addClass('st-drag-over');
    e.preventDefault();
  }

  function dragLeave(e) {
    $(e.currentTarget).removeClass('st-drag-over');
    e.preventDefault();
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