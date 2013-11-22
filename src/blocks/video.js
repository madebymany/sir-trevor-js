SirTrevor.Blocks.Video = (function(){

  return SirTrevor.Block.extend({

    // more providers at https://gist.github.com/jeffling/a9629ae28e076785a14f
    providers: {
      vimeo: {
        regex: /(?:http[s]?:\/\/)?(?:www.)?vimeo.com\/(.+)/,
        html: "<iframe src=\"{{protocol}}//player.vimeo.com/video/{{remote_id}}?title=0&byline=0\" width=\"580\" height=\"320\" frameborder=\"0\"></iframe>"
      },
      youtube: {
        regex: /(?:http[s]?:\/\/)?(?:www.)?(?:(?:youtube.com\/watch\?(?:.*)(?:v=))|(?:youtu.be\/))([^&].+)/,
        html: "<iframe src=\"{{protocol}}//www.youtube.com/embed/{{remote_id}}\" width=\"580\" height=\"320\" frameborder=\"0\" allowfullscreen></iframe>"
      }
    },

    type: 'video',
    title: function() { return i18n.t('blocks:video:title'); },

    droppable: true,
    pastable: true,

    icon_name: 'video',

    loadData: function(data){
      if (this.providers[data.source].square) {
        this.$editor.addClass('st-block__editor--with-square-media');
      } else {
        this.$editor.addClass('st-block__editor--with-sixteen-by-nine-media');
      } 

      var embed_string = this.providers[data.source].html
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
        _.each(this.providers, function(provider, index) {
          var match = provider.regex.exec(url);

          if(match !== null && match[1] !== undefined) {
            var data = {};
            data.source = index;
            data.remote_id = match[1];
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
