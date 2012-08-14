/*
  Gallery
*/

var dropzone_templ = "<p>Drop image block here</p>";

var Gallery = SirTrevor.BlockType.extend({ 
  
  title: "Gallery",
  className: "gallery",
  dropEnabled: true,
  editorHTML: "<div class=\"gallery-items\"><p>Gallery contents: </p><ul></ul></div>",
  dropzoneHTML: dropzone_templ,
  
  loadData: function(data){
    this.loading();
    // Find all our gallery blocks and draw nice list items from it
    if (_.isArray(data)) {
      _.each(data, _.bind(function(item){
        // Create an image block from this
        
        var img = $("<img>", {
          src: item.data.raw
        });
        
        this.$el.find('ul').append($('<li>', {
          html: img
        }));
        
      }, this));
      
      this.$el.show();
      this.$dropzone.show();
      this.ready();
    }
  },
  
  onDrop: function(tD){
    var item_id = tD.getData("text/plain"),
        block = $('#' + item_id),
        dataStruct = this.$el.data('block');
    
    if (/Image/.test(block.attr('data-type'))) {
      // It's an image block!
      var _block = _.find(this.instance.blocks, function(item){ return (item.blockID == block.attr('id')); }),
          data = _block.$el.data('block');
      
      // Add to our list
      if (!_.isArray(dataStruct.data)) {
        dataStruct.data = [];
      }
      
      dataStruct.data.push(data);
      
      // Get the image
      this.$el.show();
      var img = block.find('img');
      
      // Show our element and add this image into the gallery list
      this.$el.find('ul').append($('<li>', {
        html: img
      }));
      
      // Delete a reference (we have it in the gallery now)
      this.instance.removeBlock(_block);
      this.instance.marker.hide(); // Just in case
    }
  }
});

SirTrevor.BlockTypes.Gallery = new Gallery();