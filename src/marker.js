/*
  SirTrevor Marker
  --
  This is our toolbar. It's attached to a SirTrveor.Editor instance. 
*/

var Marker = SirTrevor.Marker = function(options, editorInstance){
  this.instance = editorInstance;
  this.options = _.extend({}, SirTrevor.DEFAULTS.marker, options || {});
  this._bindFunctions();
};

_.extend(Marker.prototype, FunctionBind, {
  
  bound: ["onButtonClick", "show", "hide", "onDrop"],
  
  render: function() {
    
    var marker = $('<span>', {
      'class': this.instance.options.baseCSSClass + "-" + this.options.baseCSSClass,
      html: '<p>' + this.options.addText + '</p><div class="buttons"></div>'
    });
    
    // Bind to the wrapper
    this.instance.$wrapper.append(marker);
    
    // Cache our elements for later use
    this.$el = marker;
    this.$btns = this.$el.find('.buttons');
    this.$p = this.$el.find('p');
    
    // Add all of our buttons
    var blockName, block; 
    
    for (blockName in this.instance.blockTypes) {
      if (SirTrevor.Blocks.hasOwnProperty(blockName)) {
        block = SirTrevor.Blocks[blockName];
        if (block.prototype.toolbarEnabled) {
          this.$btns.append(
           $("<a>", {
            "href": "#",
            "class": this.options.buttonClass + " new-" + block.prototype.className,
            "data-type": blockName,
            "text": block.prototype.title,
            click: this.onButtonClick
           }) 
          );
        }
      }
    }
    
    // Do we have any buttons?
    if(this.$btns.children().length === 0) this.$el.addClass('hidden');
    
    // Bind the drop function onto here
    this.$el.dropArea();
    this.$el.bind('drop', this.onDrop);
    
    // Bind our marker to the wrapper
    this.instance.$wrapper.bind('mouseover', this.show);
    this.instance.$wrapper.bind('mouseout', this.hide);
    
    this.$el.addClass('sir-trevor-item-ready');    
  },
    
  show: function(ev){ 
    if(ev.type == 'drag') {
      this.$p.text(this.options.dropText);
      this.$btns.hide();
    } else {
      this.$p.text(this.options.addText);
      this.$btns.show();
    }
    
    var mouse_enter = (ev) ? ev.originalEvent.pageY - this.instance.$wrapper.offset().top : 0;
    
    // Do we have any sedit blocks?
    if (this.instance.blocks.length > 0) {
    
      // Find the closest block to this position
      var closest_block = false,
          wrapper = this.instance.$wrapper,
          blockClass = "." + this.instance.options.baseCSSClass + "-block";
      
      var blockIterator = function(block, index) {
        block = $(block);
        var block_top = block.position().top - 35,
            block_bottom = block.position().top + block.outerHeight(true) - 35;
    
        if(block_top <= mouse_enter && mouse_enter < block_bottom) {
          closest_block = block;
        }
      };
      _.each(wrapper.find(blockClass), _.bind(blockIterator, this));
      
      // Position it
      if (closest_block) {
        closest_block.before(this.$el);
      } else if(mouse_enter > 0) {
        wrapper.find(blockClass).last().after(this.$el);
      } else {
        wrapper.find(blockClass).first().before(this.$el);
      }
    }
    this.$el.addClass('sir-trevor-item-ready');
  },

  hide: function(ev){ 
    this.$el.removeClass('sir-trevor-item-ready'); 
  },
  
  onDrop: function(ev){
    halt(ev);
    
    var marker = $(ev.target),
        item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
        block = $('#' + item_id);
        
    if (!_.isUndefined(item_id) && !_.isEmpty(block)) {
      marker.after(block);
    }
  },
  
  remove: function(){ this.$el.remove(); },
  
  onButtonClick: function(ev){
    halt(ev);
    var button = $(ev.target);
    
    if (button.hasClass('inactive')) {
      alert('You cannot create any more blocks of this type');
      return false;
    }
    
    this.instance.createBlock(button.attr('data-type'), {});
  }
});



