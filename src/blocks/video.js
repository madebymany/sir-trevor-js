SirTrevor.Blocks.Video = (function(){

  var video_regex = /http[s]?:\/\/(?:www.)?(?:(vimeo).com\/(.*))|(?:(youtu(?:be)?).(?:be|com)\/(?:watch\?v=)?([^&]*)(?:&(?:.))?)/;

  return SirTrevor.Block.extend({

    type: 'video',
    title: function() { return i18n.t('blocks:video:title'); },

    droppable: true,
    pastable: true,

    icon_name: 'video',

    loadData: function(data){
      this.$editor.addClass('st-block__editor--with-sixteen-by-nine-media');

      if(data.source == "youtube" || data.source == "youtu") {
        this.$editor.html("<iframe src=\""+window.location.protocol+"//www.youtube.com/embed/" + data.remote_id + "\" width=\"580\" height=\"320\" frameborder=\"0\" allowfullscreen></iframe>");
      } else if(data.source == "vimeo") {
        this.$editor.html("<iframe src=\""+window.location.protocol+"//player.vimeo.com/video/" + data.remote_id + "?title=0&byline=0\" width=\"580\" height=\"320\" frameborder=\"0\"></iframe>");
      }
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
        if (url.indexOf("youtu") != -1 || url.indexOf("vimeo") != -1) {

          var data = {},
          videos = url.match(video_regex);

          // Work out the source and extract ID
          if(videos[3] !== undefined) {
            data.source = videos[3];
            data.remote_id = videos[4];
          } else if (videos[1] !== undefined) {
            data.source = videos[1];
            data.remote_id = videos[2];
          }

          if (data.source == "youtu") {
            data.source = "youtube";
          }

          // Save the data
          this.setAndLoadData(data);
        }
      }

    },

    onDrop: function(transferData){
      var url = transferData.getData('text/plain');
      this.handleDropPaste(url);
    }
  });

})();
