/* Extends simple file upload files with the Crop tool */

(function($){

  var methods = {

    init : function(options) {

      return this.each(function(){

      /* Extend file upload fields */
        
        if($(this).parents('.image_block').length==0) $(this).wrap($('<div>', { "class": "image_block" }));
        if($(this).parents('.dropzone').length==0) $(this).wrap($('<div>',{ "class": "dropzone", dropzone: "move copy" }));
        if($(this).parents('.dropzone').siblings('.image_editor').length==0) $(this).parents('.dropzone').before($('<div>', { "class": "image_editor" } ));

        $(this).data('image_editor', {
          block : $(this).parents('.image_block'),
          dropzone : $(this).parents('.dropzone'),
          editor : $(this).parents('.dropzone').siblings('.image_editor')
        }); 

        dom = $(this).data('image_editor');

        dom.editor.prepend('<span class="image_preview"></span>');
        dom.dropzone.append('<button>...or choose file</button>');
        dom.dropzone.prepend(dom.dropzone.siblings('label'));

        dom.preview = dom.editor.find('.image_preview');

      /* If editing (input has JSON on the DOM),
      show with option to change image */

        if(!$.isEmptyObject($(this).data('json'))) {

          dom.dropzone.hide();
          dom.editor.show();

          dom.preview.append($('<img>',{src: $(this).data('json')["post"]["url"] }));
          dom.preview.append('<a class="change non_canvas crop-ui">change image</a>');

          dom.preview.find('.change').on('click',function(ev){

            input = $(this).parents('.image_block').find('input[type="file"]');
            dom = $(input).data('image_editor');

            dom.dropzone.show();
            dom.editor.hide();

          });

        } else {
          dom.editor.hide();
        }

      /* Attach events */
        
        $(this).bind('click',function(ev){ ev.stopPropagation(); });
        dom.dropzone.find('button').bind('click',function(ev){ ev.preventDefault(); })

        $(this).on('change',function(ev){
          if(ev.currentTarget.files[0].type.match(/image.*/)) {
            $(this).image_editor('load_editor',ev.currentTarget.files[0]);
          }
        });

        dom.block.not('.sedit_block').on('drop', function(ev){

          // Sedit binds it's dragging to the window
          if(typeof(editor)!=='undefined') editor.hide_marker();

          $('.image_block').removeClass('dragover');
          input = $(this).find('input[type="file"]');

          ev.preventDefault(); ev.stopPropagation();
          ev = ev.originalEvent.dataTransfer;

          if($.inArray("Files",ev.types) != -1) {

            if(ev.files[0].type.match(/image.*/)) {
              $(input).image_editor('load_editor',ev.files[0]);
            } else {
              $(input).preview_error("Image format not recognised.");
            }

          }

        });
        
        // Complex solutions to the lack of dragexit
        dom.dropzone.parents('.image_block').not('.sedit_block').bind('dragover',function(ev){

          target = $(ev.target)
          if(!target.hasClass('.image_block')) target = $(target.parents('.image_block')[0]);
          if(target.length>0) target.addClass('dragover');
    
          ev.preventDefault();
          
        }.bind(this)).bind('dragleave',function(ev){
          $('.image_block').removeClass('dragover');
        });

      /* Callbacks from crop tool events */
        
        $.unsubscribe("/editor/crop");
        $.subscribe("/editor/crop", function(e, file, input) {

          $(input).image_editor('clear_errors');

          $(input).parents('form').find('[type="submit"]').each(function(i,e){
            if(!$(e).is(':disabled')) {
              $(e).attr('disabled','disabled').data('label',$(e).val()).val('Please wait...');
            }
          });
          
          $.ajax({
            type: 'POST',
            url: '/images',
            data: { image: file },
            dataType: 'json',
            context: $(input),
            success: function(data, textStatus, jqXHR) {

              if(data.file!==undefined && $.isArray(data.file)) {
                $(this).image_editor('show_error', 'Image could not be saved: '+data.file[0]);
              } else if(data.file!==undefined && data.id !== undefined) {
                data.file.id = data.id;
                $(this).data('json', data.file); 
              }

            },
            error: function() {

              $(this).image_editor('show_error', 'Image could not be saved.');

            },
            complete: function() {

              $(this).parents('form').find('[type="submit"]').each(function(i,e){
                if($(e).is(':disabled')) {
                  $(e).removeAttr('disabled').val($(e).data('label'));
                }
              });

            }
          });
       
        });

        $.unsubscribe("/editor/cropready");
        $.subscribe("/editor/cropready", function(e,input) {

          dom = $(input).data('image_editor');
          dom.dropzone.hide();
          dom.editor.show();

        });

        $.unsubscribe("/editor/change");
        $.subscribe("/editor/change", function(e,input) {

          dom = $(input).data('image_editor');

          $(input).image_editor('clear_errors');
          dom.dropzone.show();
          dom.editor.hide();

        });
        
        $.unsubscribe("/editor/notice");
        $.subscribe("/editor/notice", function(e,error,input) {
          $(input).image_editor('show_error',error);
        });

        $.unsubscribe("/editor/clearnotice");
        $.subscribe("/editor/clearnotice", function(e,input) {
          $(input).image_editor('clear_errors');
        });

      });

    },

    load_editor : function(file) {
      return this.each(function(){

        dom = $(this).data('image_editor');
        $(this).image_editor('clear_errors');
        dom.preview.html('');

        new UTILS.CroppingTool(file, { preview : dom.preview[0], editorWidth : dom.preview.width(), maxWidth : 1000, id: $(this) });

      });
    },

    show_error : function(error) {
      return this.each(function(){

        dom = $(this).data('image_editor');

        dom.block.addClass('field_with_errors');
        dom.block.find('.error').remove();
        dom.block.prepend('<p class="error">'+error+'</p>');

      });
    },

    clear_errors : function() {
      return this.each(function(){
        
        dom = $(this).data('image_editor');

        dom.block.removeClass('field_with_errors');
        dom.block.find('.sedit_block_editor').removeClass('field_with_errors')
        dom.block.find('.error').remove();

      });
    }

  };

  $.fn.image_editor = function(method) {

    if (methods[method]) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.image_preview');
    }  

  }
   
})(jQuery);
