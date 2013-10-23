SirTrevor.Blocks.Embedly = (function(){

  return SirTrevor.Block.extend({

    type: "embedly",

    key: '',

    droppable: true,
    pastable: true,
    fetchable: true,

    icon_name: "embed",

    loadData: function(data){
      if (data.html) {
       this.$editor.addClass('st-block__editor--with-sixteen-by-nine-media');
       this.$editor.html(data.html);
      } else if (data.type == "photo") {
       this.$editor.html("<img src=\""+data.url+"\" />");
      }
    },

    onContentPasted: function(event){
      var input = $(event.target),
          val = input.val();

      this.handleDropPaste(val);
    },

    handleDropPaste: function(url){
      if(!_.isURI(url)) {
        SirTrevor.log("Must be a URL");
        return;
      }

      this.loading();

      var embedlyCallbackSuccess = function(data) {
        this.setAndLoadData(data);
        this.ready();
      };

      var embedlyCallbackFail = function() {
        this.ready();
      };

      var ajaxOptions = {
        url: this.buildAPIUrl(url),
        dataType: "jsonp"
      };

      this.fetch(ajaxOptions,
                 _.bind(embedlyCallbackSuccess, this),
                 _.bind(embedlyCallbackFail, this));
    },

    buildAPIUrl: function(url) {
      return "//api.embed.ly/1/oembed?key=" + this.key + "&url=" + escape(url);
    },

    onDrop: function(transferData){
      this.handleDropPaste(transferData.getData('text/plain'));
    }

  });

})();
