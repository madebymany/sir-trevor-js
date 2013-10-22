SirTrevor.Blocks.Video = (function(){

  var video_regexes = {
    'vimeo': /http[s]?:\/\/(?:www.)?(?:(vimeo).com\/(.*))/,
    'youtube': /http[s]?:\/\/(?:www.)?(?:(youtu(?:be)?).(?:be|com)\/(?:watch\?v=)?([^&]*)(?:&(?:.))?)/,
    'vine': /http[s]?:\/\/(?:www.)?(?:(vine.co\/v\/)([^\/]*))/
  };

  var embed_strings = {
    'youtube': "<iframe src=\"{{protocol}}//www.youtube.com/embed/{{remote_id}}\" width=\"580\" height=\"320\" frameborder=\"0\" allowfullscreen></iframe>",
    'vimeo': "<iframe src=\"{{protocol}}//player.vimeo.com/video/{{remote_id}}?title=0&byline=0\" width=\"580\" height=\"320\" frameborder=\"0\"></iframe>",
    'vine': "<iframe class=\"vine-embed\" src=\"{{protocol}}//vine.co/v/{{remote_id}}/embed/simple\" width=\"{{width}}\" height=\"{{width}}\" frameborder=\"0\"></iframe><script async src=\"http://platform.vine.co/static/scripts/embed.js\" charset=\"utf-8\"></script>"
  };

  return SirTrevor.Block.extend({

    type: 'Video',

    droppable: true,
    pastable: true,

    icon_name: 'video',

    loadData: function(data){
      if (data.source === 'vine') {
        this.$editor.addClass('st-block__editor--with-square-media');
      } else {
        this.$editor.addClass('st-block__editor--with-sixteen-by-nine-media');
      } 

      var embed_string = embed_strings[data.source]
        .replace('{{protocol}}', window.location.protocol)
        .replace('{{remote_id}}', data.remote_id)
        .replace('{{width}}', this.$editor.width()); // for videos that can't resize automatically like vine

      this.$editor.html(embed_string);
    },

    onContentPasted: function(event){
      // Content pasted. Delegate to the drop parse method
      var input = $(event.target),
          val = input.val();

      // Pass this to the same handler as onDrop
      this.handleDropPaste(val);
    },

    handleDropPaste: function(url){

      if(_.isURI(url))
      {
        _.each(video_regexes, function(element, index) {
          var match = element.exec(url);
          if(match !== null && match[2] !== undefined) {
            console.log(match);
            var data = {};
            data.source = index;
            data.remote_id = match[2];
            // save the data 
            this.setAndLoadData(data);
          }  
        }.bind(this));
      }

    },

    onDrop: function(transferData){
      var url = transferData.getData('text/plain');
      this.handleDropPaste(url);
    }
  });

})();
