/* A Block representation */

var Block = SirTrevor.Block = function(instance, parentBlockType, data) {
  
  this.blockID = _.uniqueId(parentBlockType.blockTypeID + '_block-');
  
  this.instance = instance; // SirTrevor.Editor instance
  this.blockType = parentBlockType; // SirTrevor.BlockType
  
  this.data = data;
  this.type = this.blockType.blockType();  // Cache the blocktype. 

  this.errors = [];
  
  this._setElement();
  this._bindFunctions();
  this.render();
};

_.extend(Block.prototype, FunctionBind, {
  
  bound: ["onDeleteClick", "onContentPasted", "onBlockFocus", "onDrop", "onDragStart", "onDragEnd"],
  
  $: function(selector) {
    return this.$el.find(selector);
  },
  
  render: function() {
    
    this._super("beforeBlockRender");
    
    this.$block = block = $('<div>', { 
      'class': this.instance.options.baseCSSClass + "-block", 
      id: this.blockID,
      "data-type": this.type,
      html: this.el
    });
    
    // Insert before the marker
    this.instance.formatBar.hide();
    this.instance.marker.hide();
    this.instance.marker.$el.before(block);
    
    // Do we have a dropzone? 
    if (this.blockType.dropEnabled) {
      this.$dropzone = $("<div>", {
        html: this.blockType.dropzoneHTML,
        class: "dropzone"
      });
      this.$block.append(this.$dropzone);
      this.$el.hide();
    }
    
    // Has data already?
    if (!_.isUndefined(this.data) && !_.isEmpty(this.data)) {
      this.loadData();
    }
    
    // And save the state
    this.save();
    
    // Add UI elements
    block.append($('<span>',{ 'class': 'handle', draggable: true }));
    block.append($('<span>',{ 'class': 'delete' }));
    
    // Stop events propagating through to the container
    block
      .bind('drop', halt)
      .bind('mouseover', halt)
      .bind('mouseout', halt)
      .bind('mouseover', function(ev){ $(this).siblings().removeClass('active'); $(this).addClass('active'); })
      .bind('mouseout', function(ev){ $(this).removeClass('active'); });
    
    // Enable formatting keyboard input
    var formatter;
    for (var name in this.instance.formatters) {
      if (this.instance.formatters.hasOwnProperty(name)) {
        formatter = SirTrevor.Formatters[name];
        if (!_.isUndefined(formatter.keyCode)) {
          formatter._bindToBlock(block);
        }
      }
    }
    
    // Hanlde pastes
    block.find('.paste-block')
      .bind('click', function(){ $(this).select(); })
      .bind('paste', this.onContentPasted)
      .bind('submit', this.onContentPasted); 
    
    // Delete
    block.find('.delete').bind('click', this.onDeleteClick);
    
    // Handle text blocks
    if (block.find('.text-block').length > 0) {
      document.execCommand("styleWithCSS", false, false);
      document.execCommand("insertBrOnReturn", false, true);
      
      // Bind our text block to show the format bar
      block.find('.text-block').focus(this.onBlockFocus);
    }
    
    if (this.blockType.dropEnabled) {
      // Bind our drop event
      this.$dropzone.dropArea();
      this.$dropzone.bind('drop', this.onDrop);
    }
    
    // Focus if we're adding an empty block
    if (_.isEmpty(this.data)) {
      var inputs = block.find('[contenteditable="true"], input');
      if (inputs.length > 0 && !this.blockType.dropEnabled) {
        inputs[0].focus();
      }
    }
    
    // Reorderable
    block.find('.handle')
      .dropArea()
      .bind('dragstart', this.onDragStart)
      .bind('drag', this.instance.marker.show)
      .bind('dragend', this.onDragEnd)
      .bind('dragleave', function(){});
    
    // Set ready state
    block.addClass('sir-trevor-item-ready');
    
    this._super("onBlockRender");
  },
  
  remove: function() {
    this.$el.parent().remove();
  },
  
  loadData: function() {
    this._super("loadData", this.data);
  },

  validate: function() {
    this.errors = []; 
    this.$('.error').removeClass('error');
    this.$('.error-marker').remove();
    return this._super("validate");
  },
  
  showErrors: function() {
    _.each(this.errors, _.bind(function(error){
      
    }, this));
  },
  
  /* Save the state of this block onto the blocks data attr */
  save: function() {
    var data = this.$el.data('block');
    if (_.isUndefined(data)) {
      // Create our data object on the element
      this.$el.data('block', this.to_json(this.data));
    } else {
      // We need to grab the state and save it here.
      this._super('toData');
    }
    return this.$el.data('block');
  },
  
  to_json: function(data) {
    return {
      type: this.type,
      data: data
    };
  },
  
  loading: function() {
    this.spinner = new Spinner(this.instance.options.spinner);
    this.spinner.spin(this.$block[0]);
    this.$block.addClass('loading');
  },
  
  ready: function() {
    this.$block.removeClass('loading');
    if (!_.isUndefined(this.spinner)) {
      this.spinner.stop();
      delete this.spinner;
    }
  },
  
  // Event handlers
  
  onDragStart: function(ev){
    var item = $(ev.target);
    ev.originalEvent.dataTransfer.setData('Text', item.parent().attr('id'));
    ev.originalEvent.dataTransfer.setDragImage(item.parent()[0], 13, 25);
    item.parent().addClass('dragging');
    this.instance.formatBar.hide();
  },
  
  onDragEnd: function(ev){
    var item = $(ev.target);
    item.parent().removeClass('dragging');
    this.instance.marker.hide();
  },
  
  onBlockFocus: function(ev) {
    this.instance.formatBar.show(this.$el);
  },
  
  onDeleteClick: function(ev) {
    if (confirm('Are you sure you wish to delete this content?')) {
      this.instance.removeBlock(this);
      halt(ev);
    }
  },
  
  onContentPasted: function(ev) {
    // We need a little timeout here
    var timed = function(ev){ 
      // Delegate this off to the super method that can be overwritten
      this._super("onContentPasted", ev);
    };
    _.delay(_.bind(timed, this, ev), 100);
  },
  
  onDrop: function(e) {
    
    e.preventDefault();
    e = e.originalEvent;
  
    var el = $(e.target),
        types = e.dataTransfer.types,
        type, data = [];
    
    this.$dropzone.removeClass('dragOver');
        
    /*
      Check the type we just received,
      delegate it away to our blockTypes to process
    */    
    
    if (!_.isUndefined(types))
    {
      if (_.include(types, 'Files') || _.include(types, 'text/plain') || _.include(types, 'text/uri-list')) 
      {
        this._super("onDrop", e.dataTransfer);
      } 
    }
  },
  
  /*
    Generic Upload Attachment Function
    Designed to handle any attachments
  */
  
  uploadAttachment: function(file, callback){
    
    var uid  = [this.instance.ID, (new Date()).getTime(), 'raw'].join('-');
    
    var data = new FormData();
    
    data.append('attachment[name]', file.name);
    data.append('attachment[file]', file);
    data.append('attachment[uid]', uid);
    
    var callbackSuccess = function(data){
    
      if (!_.isUndefined(callback) && _.isFunction(callback)) {
        _.bind(callback, this)(data); // Invoke with a reference to 'this' (the block)
      }
      
    };
    
    $.ajax({
      url: this.instance.options.uploadUrl,
      data: data,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      success: _.bind(callbackSuccess, this)
    });
    
  },
  
  parseUrlInput: function(text){
    var url = text.match(this.regexs.url);
  },
  
  /*
    Our template is always either a string or a function
  */
  _setElement: function(){
    var el = (_.isFunction(this.blockType.editorHTML)) ? this.blockType.editorHTML() : this.blockType.editorHTML;
    
    // Wrap in a block
    var block = $('<div>', {
      'class': 'block-editor ' + this.blockType.className + '-block',
      html: el
    });
    
    // Set our element references
    this.$el = block;
    this.el = this.$el[0];
  },
  
  /* A wrapper to call our parent object */
  _super: function(functionName, args) {
    if (!_.isUndefined(this.blockType[functionName])) {
      return _.bind(this.blockType[functionName], this, args)();
    }
  }
});
