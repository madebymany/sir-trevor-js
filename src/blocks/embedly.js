SirTrevor.Blocks.Embedly = (function(){

  return SirTrevor.Block.extend({

    type: 'Embedly',
    key: '',

    droppable: true,
    pastable: true,


    loadData: function(data){
      if (data.html) {
       this.$editor.addClass('st-block__editor--with-sixteen-by-nine-media');
       this.$editor.html(data.html);
      } else if (data.type == "photo") {
       this.$editor.html("<img src=\""+data.url+"\" />");
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
        this.loading();

        var embedlyCallbackSuccess = function(data) {
          this.setData(data);
          this._loadData();
          this.ready();

        };

        var embedlyCallbackFail = function() {
          this.ready();
        };

        $.ajax({
          url: "http://api.embed.ly/1/oembed?key=" + this.key + "&url=" + escape(url),
          dataType: "jsonp",
          success: _.bind(embedlyCallbackSuccess, this),
          error: _.bind(embedlyCallbackFail, this)
        });
      }

    },

    onDrop: function(transferData){
      var url = transferData.getData('text/plain');
      this.handleDropPaste(url);
    }
  });

})();
