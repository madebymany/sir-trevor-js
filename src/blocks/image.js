/*
  Simple Image Block
*/

SirTrevor.Blocks.Image = SirTrevor.Block.extend({

  type: "Image",

  droppable: true,
  uploadable: true,

  loadData: function(data){
    // Create our image tag
    this.$editor.html($('<img>', { src: data.file.url }));
  },

  onBlockRender: function(){
    /* Setup the upload button */
    this.$inputs.find('button').bind('click', function(ev){ ev.preventDefault(); });
    this.$inputs.find('input').on('change', _.bind(function(ev){
      this.onDrop(ev.currentTarget);
    }, this));
  },

  onDrop: function(transferData){
    var file = transferData.files[0],
        urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;

    // Handle one upload at a time
    if (/image/.test(file.type)) {
      this.loading();
      // Show this image on here
      this.$inputs.hide();
      this.$editor.html($('<img>', { src: urlAPI.createObjectURL(file) })).show();

      // Upload!
      SirTrevor.EventBus.trigger('setSubmitButton', ['Please wait...']);
      this.uploader(
        file,
        function(data) {
          this.setData(data);
          this.ready();
        },
        function(error){
          this.addMessage("There was a problem with your upload");
          this.ready();
        }
      );
    }
  }
});