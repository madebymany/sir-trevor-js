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

_.extend(Block.prototype, {
  
  bound: ["handleDeleteClick"],
    
  $: function(selector) {
    return this.$el.find(selector);
  },
  
  render: function() {
    
    this._super("beforeBlockRender");
    
    this.$block = block = $('<div>', { 
      'class': this.instance.options.baseCSSClass + "-block", 
      id: this.blockID,
      "data-type": this.type,
      html: this.$el
    });
    
    this.instance.$wrapper.append(block);
    
    // Has data already?
    if (!_.isUndefined(this.data) && !_.isEmpty(this.data)) {
      this.loadData();
    }
    
    // And save the state
    this.save();
    
    // Set ready state
    block.addClass('block-ready');
    
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
    
    // Enable formatting keyboard input
    var formatter;
    for (var name in this.instance.formatters) {
      if (this.instance.formatters.hasOwnProperty(name)) {
        formatter = SirTrevor.Formatters[name];
        if (!_.isUndefined(formatter.keyCode)) {
          var ctrlDown = false;

          block
            .on('keyup','.text-block', function(ev) {
              if(ev.which == 17 || ev.which == 224) { 
                ctrlDown = false;
              }
            })
            .on('keydown','.text-block', { formatter: formatter }, function(ev) {
              if(ev.which == 17 || ev.which == 224) { 
                ctrlDown = true;
              }  
              if(ev.which == ev.data.formatter.keyCode && ctrlDown === true) {
                document.execCommand(ev.data.formatter.cmd, false, true);
                ev.preventDefault();
              }
            });
        }
      }
    }
    
    // TODO: Paste abstraction
    /*block.find('.paste-block')
      .bind('click', function(){
        $(this).select();
      })
      .bind('paste', function(ev){ console.log('Pasted'); }); */
    
    // Do we have a dropzone? 
    if (this.blockType.dropEnabled) {}
    
    // Delete
    block.find('.delete').bind('click', this.handleDeleteClick);
    
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
  },
  
  to_json: function(data) {
    return {
      type: this.type,
      data: data
    };
  },
  
  // Event handlers
  handleDeleteClick: function(ev){
    if (confirm('Are you sure you wish to delete this content?')) {
      this.instance.removeBlock(this);
      halt(ev);
    }
  },
  
  /*
    Our template is always either a string or a function
  */
  _setElement: function(){
    var el = (_.isFunction(this.blockType.editorHTML)) ? this.blockType.editorHTML() : this.blockType.editorHTML;
    
    // Wrap in a block
    var block = $('<div>', {
      'class': 'block_editor',
      html: el
    });
    
    // Set our element references
    this.$el = block;
    this.el = this.$el[0];
  },
  
  /* A wrapper to call our parent object */
  _super: function(functionName, args) {
     return this.blockType[functionName](this, args);
  },
  
  _bindFunctions: function(){
    _.bindAll(this, this.bound);
  }
});
