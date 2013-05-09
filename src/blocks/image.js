/*
  Simple Image Block
*/

var dropzone_templ = "<p>Drop image here</p><div class=\"input submit\"><input type=\"file\" /></div><button>...or choose a file</button>";


SirTrevor.Blocks.Image = SirTrevor.Block.extend({ 
  
  title: "Image",
  className: "image",
  dropEnabled: true,
  
  dropzoneHTML: dropzone_templ,
  
  loadData: function(data){
    // Create our image tag
    this.$editor.html($('<img>', {
      src: data.file.url
    }));
  },
  
  onBlockRender: function(){
    /* Setup the upload button */
    this.$dropzone.find('button').bind('click', halt);
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
      this.$editor.html($('<img>', {
        src: urlAPI.createObjectURL(file)
      }));
      this.$editor.show();
      
      // Upload!
      SirTrevor.publish('setSubmitButton', ['Please wait...']); 
      this.uploader(
        file, 
        function(data){
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