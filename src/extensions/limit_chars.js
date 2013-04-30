/* Soft character limits on inputs and textareas */

(function($){

  $.fn.limit_chars = function() {

    if (this.length===0) return;

    // Remove browser maxlength, add soft limit
    if(this.attr('maxlength')) {
      this.attr('data-maxlength',this.attr('maxlength'));
      this.removeAttr('maxlength');
    }

    if(this.parents('.extended_input').length === 0) {

      count = (this.chars()<this.attr('data-maxlength')) ? this.chars() : '<em>'+this.chars()+'</em>';

      // Build UI
      this.wrap($('<div>',{
        "class": "extended_input"
      })).after($('<span>', {
        "class": "count",
        html: count+' of '+this.attr('data-maxlength')
      }));

      // Attach event
      this.bind('keydown keyup paste',function(ev){
        count = ($(this).chars()<$(this).attr('data-maxlength')) ? $(this).chars() : '<em>'+$(this).chars()+'</em>';
        $(this).parent().find('.count').html(count+' of '+$(this).attr('data-maxlength'));
      });

    }

  };

  $.fn.chars = function() {
    count = (this.attr('contenteditable')!==undefined) ? this.text().length : this.val().length;
    return count;
  };

  $.fn.too_long = function() {
    return this.chars() > this.attr('data-maxlength');
  };

})(jQuery);