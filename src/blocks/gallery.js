/*
  Gallery
*/

var dropzone_templ = "<p>Drop images here</p><div class=\"input submit\"><input type=\"file\" multiple=\"multiple\" /></div><button>...or choose file(s)</button>";

SirTrevor.Blocks.Gallery = SirTrevor.Block.extend({ 
  
  title: "Gallery",
  className: "gallery",
  dropEnabled: true,
  editorHTML: "<div class=\"gallery-items\"><p>Gallery Contents:</p><ul></ul></div>",
  dropzoneHTML: dropzone_templ,
  
  loadData: function(data){
    // Find all our gallery blocks and draw nice list items from it
    if (_.isArray(data)) {
      _.each(data, _.bind(function(item){
        // Create an image block from this
        this.renderGalleryThumb(item);
      }, this));
      
      // Show the dropzone too
      this.$dropzone.show();
    }
  },
  
  renderGalleryThumb: function(item) {
    
    if(_.isUndefined(item.data.file)) return false;
    
    var img = $("<img>", {
      src: item.data.file.thumb.url
    });
    
    var list = $('<li>', {
      id: _.uniqueId('gallery-item'),
      class: 'gallery-item',
      html: img
    });
    
    list.append($("<span>", {
      class: 'delete',
      click: _.bind(function(e){
        // Remove this item
        halt(e);
        
        if (confirm('Are you sure you wish to delete this image?')) {
          $(e.target).parent().remove();
          this.reindexData();
        }
      }, this)
    }));
    
    list.data('block', item);
    
    this.$$('ul').append(list);
    
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
        
        var item = $(ev.target),
            parent = item.parent();
            
        item = (item.hasClass('gallery-item') ? item : parent);    
        
        this.$$('ul li.dragover').removeClass('dragover');
        
        // Get the item
        var target = $('#' + ev.originalEvent.dataTransfer.getData("text/plain"));
        
        if(target.attr('id') === item.attr('id')) return false;
        
        if (target.length > 0 && target.hasClass('gallery-item')) {
          item.before(target);
        }
        
        // Reindex the data
        this.reindexData();
                
      }, this));
  },
  
  onBlockRender: function(){
    // We need to setup this block for reordering
     /* Setup the upload button */
      this.$dropzone.find('button').bind('click', halt);
      this.$dropzone.find('input').on('change', _.bind(function(ev){
        this.onDrop(ev.currentTarget);
      }, this));
  },
  
  reindexData: function() {
    var dataStruct = this.getData();
    dataStruct = [];

    _.each(this.$$('li.gallery-item'), function(li){
      li = $(li);
      dataStruct.push(li.data('block'));
    });
    
    this.setData(dataStruct);
  },
  
  onDrop: function(transferData){
        
    if (transferData.files.length > 0) {
      // Multi files 'ere
      var l = transferData.files.length,
          file, urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;

      this.loading();
      
      while (l--) {
        file = transferData.files[l];
        if (/image/.test(file.type)) {
          // Inc the upload count
          this.uploadsCount += 1;
          this.$editor.show();
          
          /* Upload */
          this.uploader(file, function(data){
            
            this.uploadsCount -= 1;
            var dataStruct = this.getData();
            data = { type: "image", data: data };
            
            // Add to our struct
            if (!_.isArray(dataStruct)) {
              dataStruct = [];
            }
            dataStruct.push(data);
            this.setData(dataStruct);
            
            // Pass this off to our render gallery thumb method
            this.renderGalleryThumb(data);
            
            if(this.uploadsCount === 0) {
              this.ready();
            }
          });
        }
      }
    }
  }
  
});