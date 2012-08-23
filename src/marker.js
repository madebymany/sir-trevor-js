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
    
    // Bind our marker to the wrapper
    this.instance.$outer.bind('mouseover', this.show);
    this.instance.$outer.bind('mouseout', this.hide);
    this.instance.$outer.bind('dragover', this.show);    
    this.$el.bind('dragover',halt);
    
    // Bind the drop function onto here
    this.instance.$outer.dropArea();
    this.instance.$outer.bind('dragleave', this.hide);    
    this.instance.$outer.bind('drop', this.onDrop);
    
    this.$el.addClass('sir-trevor-item-ready');    
  },
    
  show: function(ev){ 
    
    if(ev.type == 'drag' || ev.type == 'dragover') {
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
        var block_top = block.position().top - 40,
            block_bottom = block.position().top + block.outerHeight(true) - 40;
    
        if(block_top <= mouse_enter && mouse_enter < block_bottom) {
          closest_block = block;
        }
      };
      _.each(wrapper.find(blockClass), _.bind(blockIterator, this));
            
      // Position it
      if (closest_block) {
        this.$el.insertBefore(closest_block);
      } else if(mouse_enter > 0) {
        this.$el.insertAfter(wrapper.find(blockClass).last());
      } else {
        this.$el.insertBefore(wrapper.find(blockClass).first());
      }
    }
    this.$el.addClass('sir-trevor-item-ready');
  },

  hide: function(ev){ 
    this.$el.removeClass('sir-trevor-item-ready'); 
  },
  
  onDrop: function(ev){
    ev.preventDefault();
       
    var marker = this.$el,
        item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
        block = $('#' + item_id);
        
    if (!_.isUndefined(item_id) && !_.isEmpty(block) && block.attr('data-instance') == this.instance.ID) {
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
  },
  
  move: function(top) {
    this.$el.css({
      top: top
    });
    this.$el.show();
    this.$el.addClass('sir-trevor-item-ready');
  }
});



