SirTrevor.Blocks.Embedly = (function(){

  return SirTrevor.Block.extend({

    type: 'Embedly',

    droppable: true,
    pastable: true,


    loadData: function(data){
      this.$editor.addClass('st-block__editor--with-sixteen-by-nine-media');

      if (data.html != "") {
        this.$editor.html(data.html);
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
          console.log("success");
          this.setData(data);
          this._loadData();
          this.ready();

        };

        var embedlyCallbackFail = function() {
          this.ready();
        };

        $.ajax({
          url: "http://api.embed.ly/1/oembed?key=f8357aee49354b529381411d253e597d&url=" + escape(url),
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
