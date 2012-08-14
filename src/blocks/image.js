/*
  Simple Image Block
*/

var dropzone_templ = "<p>Drop image here</p><div class=\"input submit\"><input type=\"file\" /></div>";


var ImageBlock = SirTrevor.BlockType.extend({ 
  
  title: "Image",
  className: "image",
  dropEnabled: true,
  
  dropzoneHTML: dropzone_templ,
  
  loadData: function(data){
    // Create our image tag
    this.loading();
    this.$dropzone.hide();
    this.$el.html($('<img>', {
      src: data.raw
    }));
    this.$el.show();
    this.ready();
  },
  
  onBlockRender: function(){
    /* Setup the upload button */
    this.$dropzone.find('input').on('change', _.bind(function(ev){
      this._super("onDrop", ev.currentTarget);
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
      this.$el.html($('<img>', {
        src: urlAPI.createObjectURL(file)
      }));
      this.$el.show();
      
      // Upload!
      this.uploadAttachment(file, function(data){
        // Store the data on this block
        var dataStruct = this.$el.data('block');
        dataStruct.data = data;
        // Done
        this.ready();
      });
    }
  }
});

SirTrevor.BlockTypes.Image = new ImageBlock();