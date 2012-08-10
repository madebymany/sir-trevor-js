/* A Block representation */

var Block = SirTrevor.Block = function(instance, parentBlockType, data) {
  
  this.blockID = _.uniqueId(parentBlockType.blockTypeID + '_block-');
  this.instance = instance; // SirTrevor.Editor instance
  this.blockType = parentBlockType;
  
  this.data = data;
  this.type = this.blockType.blockType();  // Cache the blocktype. 

  this.errors = [];
  
  this._setElement();
  this._bindFunctions();
  this.render();
};

_.extend(Block.prototype, Events, {
  
  bound: ["onDeleteClick", "onContentPasted", "onBlockFocus"],
  
  regexs: {
    url: /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/m,
    video: /http[s]?:\/\/(?:www.)?(?:(vimeo).com\/(.*))|(?:(youtu(?:be)?).(?:be|com)\/(?:watch\?v=)?([^&]*)(?:&(?:.))?)/
  },
  
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
    this.instance.marker.hide();
    this.instance.marker.$el.before(block);
    
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
    block.bind('click', halt)
      .bind('drop', halt)
      .bind('mouseover', halt)
      .bind('mouseout', halt)
      .bind('dragleave', halt)
      .bind('mouseover', function(ev){ $(this).siblings().removeClass('active'); $(this).addClass('active'); })
      .bind('mouseout', function(ev){ $(this).removeClass('active'); });
    
   // block.find('.block-above').bind('mouseover', this.onMouseOverAbove);
  //  block.find('.block-below').bind('mouseover', this.onMouseOverBelow);
    
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
      .bind('paste', this.onContentPasted); 
    
    // Do we have a dropzone? 
    if (this.blockType.dropEnabled) {}
    
    // Delete
    block.find('.delete').bind('click', this.onDeleteClick);
    
    // Handle text blocks
    if (block.find('.text-block').length > 0) {
      document.execCommand("styleWithCSS", false, false);
      document.execCommand("insertBrOnReturn", false, true);
      
      // Bind our text block to show the marker
      block.find('.text-block').focus(this.onBlockFocus);
    }
    
    // Focus if we're adding an empty block
    if (_.isEmpty(this.data)) {
      var inputs = block.find('[contenteditable="true"], input');
      if (inputs.length > 0 && !block.dropEnabled) {
        inputs[0].focus();
      }
    }
    
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
    var result = this._super("validate");
    return result;
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
  
  
  // Event handlers

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
  
  onContentDrop: function(){},
  
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
      html: "<div class='block-above'></div>" + el + "<div class='block-below'></div>"
    });
    
    // Set our element references
    this.$el = block;
    this.el = this.$el[0];
  },
  
  /* A wrapper to call our parent object */
  _super: function(functionName, args) {
    if (!_.isUndefined(this.blockType[functionName])) {
      _.bind(this.blockType[functionName], this, args)();
    }
  }
});
