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
        this._super("renderGalleryThumb", item);
      }, this));
      
      this.$el.show();
      this.$dropzone.show();
      this.ready();
    }
  },
  
  renderGalleryThumb: function(item) {
    
    var img = $("<img>", {
      src: item.data.raw
    });
    
    var list = $('<li>', {
      id: _.uniqueId('gallery-item'),
      html: img,
      data: item
    });
    
    this.$el.find('ul').append(list);
    
    // Make it sortable
    list
      .dropArea()
      .bind('dragstart', _.bind(function(ev){
        var item = $(ev.target);
        ev.originalEvent.dataTransfer.setData('Text', item.parent().attr('id'));
        item.parent().addClass('dragging');
      }, this))
      
      .bind('drag', _.bind(function(ev){
        
      }, this))
      
      .bind('dragend', _.bind(function(ev){
        var item = $(ev.target);
        item.parent().removeClass('dragging');
      }, this))
      
      .bind('dragover', _.bind(function(ev){
        var item = $(ev.target);
        item.parents('li').addClass('dragover');
      }, this))
      
      .bind('dragleave', _.bind(function(ev){
        var item = $(ev.target);
        item.parents('li').removeClass('dragover');
      }, this))
      
      .bind('drop', _.bind(function(ev){
        var item = $(ev.target);
        this.$el.find('ul li.dragover').removeClass('dragover');
        
        // Get the item
        var target = $('#' + ev.originalEvent.dataTransfer.getData("text/plain"));
        
        if (target.length > 0) {
          item.parent().after(target);
        }
                
      }, this));
  },
  
  onBlockRender: function(){
    // We need to setup this block for reordering
    
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
      
      this._super("renderGalleryThumb", data);
      
      // Delete a reference (we have it in the gallery now)
      this.instance.removeBlock(_block);
      this.instance.marker.hide(); // Just in case
    }
  },
  
  onGalleryItemDrop: function(ev) {
    
  } 
  
});

SirTrevor.BlockTypes.Gallery = new Gallery();