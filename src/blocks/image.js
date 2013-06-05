/*
  Simple Image Block
*/

SirTrevor.Blocks.Image = SirTrevor.Block.extend({

  type: "Image",
  droppable: true,

  drop_options: {
    uploadable: true
  },

  loadData: function(data){
    // Create our image tag
    this.$editor.html($('<img>', { src: data.file.url }));
  },

  onBlockRender: function(){
    /* Setup the upload button */
    this.$dropzone.find('button').bind('click', function(ev){ ev.preventDefault(); });
    this.$dropzone.find('input').on('change', _.bind(function(ev){
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
      this.$dropzone.hide();
      this.$editor.html($('<img>', { src: urlAPI.createObjectURL(file) })).show();

      // Upload!
      SirTrevor.publish('setSubmitButton', ['Please wait...']);
      this.uploader(
        file,
        function(data) {
          // Store the data on this block
          this.setData(data);
          // Done
          this.ready();
        },
        function(error){
          alert('Error!');
        }
      );
    }
  }
});