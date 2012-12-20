/*
  Sir Trevor Editor
  -- 
  Represents one Sir Trevor editor instance (with multiple blocks)
  Each block references this instance. 
  BlockTypes are global however.
*/

var SirTrevorEditor = SirTrevor.Editor = function(options) {
  
  SirTrevor.log("Init SirTrevor.Editor");
  
  this.blockTypes = {};
  this.formatters = {};
  this.blockCounts = {}; // Cached block type counts
  this.blocks = []; // Block references
  this.errors = [];
  this.cachedDomBlocks = [];
  this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
  this.ID = _.uniqueId(this.options.baseCSSClass + "-");
  
  if (this._ensureAndSetElements()) {
    
    this.marker = new SirTrevor.Marker(this.options.marker, this);
    this.formatBar = new SirTrevor.FormatBar(this.options.formatBar, this);
    
    if(!_.isUndefined(this.options.onEditorRender) && _.isFunction(this.options.onEditorRender)) {
      this.onEditorRender = this.options.onEditorRender;
    }
    
    this._setRequired();
    this._setBlocksAndFormatters();
    this._bindFunctions();
    
    this.store("create", this); // Make our storage
    this.build();
    
    SirTrevor.instances.push(this); // Store a reference to this instance
    SirTrevor.bindFormSubmit(this.$form);
  }
};

_.extend(SirTrevorEditor.prototype, FunctionBind, {
  
  bound: ['onFormSubmit'],
  
  initialize: function() {},
  
  /*
    Build the Editor instance. 
    Check to see if we've been passed JSON already, and if not try and create a default block.
    If we have JSON then we need to build all of our blocks from this.
  */
  build: function() {
    this.$el.hide();
    
    // Render marker & format bar
    this.marker.render();
    this.formatBar.render();
    
    var store = this.store("read", this);
    
    if (store.data.length === 0) {
      // Create a default instance
      this.createBlock(this.options.defaultType);
    } else {
      // We have data. Build our blocks from here.
      _.each(store.data, _.bind(function(block){
        SirTrevor.log('Creating: ', block);
        this.createBlock(block.type, block.data);
      }, this));
    }
        
    this.$wrapper.addClass('sir-trevor-ready');
    
    if(!_.isUndefined(this.onEditorRender)) {
      this.onEditorRender();
    }
  },
  
  store: function(){
    return SirTrevor.editorStore.apply(this, arguments);
  },
  
  /*
    Create an instance of a block from an available type. 
    We have to check the number of blocks we're allowed to create before adding one and handle fails accordingly.
    A block will have a reference to an Editor instance & the parent BlockType.
    We also have to remember to store static counts for how many blocks we have, and keep a nice array of all the blocks available.
  */
  createBlock: function(type, data) {
    
    type = _.capitalize(type); // Proper case
    
    if (this._blockTypeAvailable(type)) {
      
     var blockType = SirTrevor.Blocks[type],
         currentBlockCount = (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type],
         totalBlockCounts = this.blocks.length,
         blockTypeLimit = this._getBlockTypeLimit(type);
         
     // Can we have another one of these blocks?
     if ((blockTypeLimit !== 0 && currentBlockCount > blockTypeLimit) || this.options.blockLimit !== 0 && totalBlockCounts >= this.options.blockLimit) {
       SirTrevor.log("Block Limit reached for type " + type);
       return false;
     }
     
     var block = new blockType(this, data || {});
     
     if (_.isUndefined(this.blockCounts[type])) {
       this.blockCounts[type] = 0;
     }
     
     this.blocks.push(block);
     currentBlockCount++;
     this.blockCounts[type] = currentBlockCount;
     
     // Check to see if we can add any more blocks
     if (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit) {
       this.marker.$el.addClass('hidden');
     }
      
     if (blockTypeLimit !== 0 && currentBlockCount >= blockTypeLimit) {
       SirTrevor.log("Block Limit reached for type " + type + " setting state as inactive");
       this.marker.$el.find('[data-type="' + type + '"]')
        .addClass('inactive')
        .attr('title','You have reached the limit for this type of block');
     }
     
     SirTrevor.publish("editor/block/createBlock");
      
     SirTrevor.log("Block created of type " + type);
     this.cachedDomBlocks = this.$wrapper.find('.' + this.baseCSS("block"));
    } else {
      SirTrevor.log("Block type not available " + type);
    }
  },
  
  removeBlock: function(block) {
    // Blocks exist purely on the dom.
    // Remove the block and decrement the blockCount
    block.remove();
    this.blockCounts[block.type] = this.blockCounts[block.type] - 1;
    
    // Remove the block from our store
    this.blocks = _.reject(this.blocks, function(item){ return (item.blockID == block.blockID); });
    if(_.isUndefined(this.blocks)) this.blocks = [];
    
    SirTrevor.publish("editor/block/removeBlock");
    this.cachedDomBlocks = this.$wrapper.find('.' + this.baseCSS("block"));
    
    // Remove our inactive class if it's no longer relevant
    if(this._getBlockTypeLimit(block.type) > this.blockCounts[block.type]) {
      SirTrevor.log("Removing block limit for " + block.type);
      this.marker.$el.find('[data-type="' + block.type + '"]')
        .removeClass('inactive')
        .attr('title','Add a ' + block.type + ' block');
    }
  },
  
  performValidations : function(_block, should_validate) {
    
    var errors = 0;
    
    if (!SirTrevor.SKIP_VALIDATION && should_validate) {
      if(!_block.validate()){
        // fail validations
        SirTrevor.log("Block " + _block.blockID + " failed validation");
        ++errors;
      }
    } else {
      // not validating so clear validation warnings
      _block._beforeValidate();
    }
    
    // success
    var store = _block.save();
    if(!_.isEmpty(store.data)) {
      SirTrevor.log("Adding data for block " + _block.blockID + " to block store");
      this.store("add", this, { data: store });
    }
    return errors;
  },
  
  /*
    Handle a form submission of this Editor instance.
    Validate all of our blocks, and serialise all data onto the JSON objects
  */
  onFormSubmit: function(should_validate) {
    
    // if undefined or null or anything other than false - treat as true
    should_validate = (should_validate === false) ? false : true;
    
    SirTrevor.log("Handling form submission for Editor " + this.ID);
    
    var blockLength, block, result, errors = 0;
    
    this.removeErrors();
    // Reset our store
    this.store("reset", this);
    
    // Loop through blocks to validate
    var blockIterator = function(block,index) {
      // Find our block
      block = $(block);
      var _block = _.find(this.blocks, function(b){ return (b.blockID == block.attr('id')); });
      
      if (!_.isUndefined(_block) || !_.isEmpty(_block) || typeof _block == SirTrevor.Block) {
        // Validate our block
        errors += this.performValidations(_block, should_validate);
      }
      
    };
    _.each(this.$wrapper.find('.' + this.options.baseCSSClass + "-block"), _.bind(blockIterator, this));

    // Validate against our required fields (if there are any)
    if (this.required && (!SirTrevor.SKIP_VALIDATION && should_validate)) {
      _.each(this.required, _.bind(function(type) {
      
        if (this._blockTypeAvailable(type)) {
          // Valid block type to validate against
          if (_.isUndefined(this.blockCounts[type]) || this.blockCounts[type] === 0) {
            
            this.errors.push({ text: "You must have a block of type " + type });
            
            SirTrevor.log("Failed validation on required block type " + type);
            errors++;
            
          } else {
            // We need to also validate that we have some data of this type too.
            // This is ugly, but necessary for proper validation on blocks that don't have required fields.
            var blocks = _.filter(this.blocks, function(b){ return (b.type == type && !_.isEmpty(b.getData())); });
            
            if (blocks.length === 0) {
              this.errors.push({ text: "A required block type " + type + " is empty" });
              errors++;
              SirTrevor.log("A required block type " + type + " is empty");
            }
            
          }
        }
      }, this));
    }

    // Save it
    this.store("save", this);
    
    if (errors > 0) this.renderErrors();
    
    return errors;
  },
  
  renderErrors: function() {
    if (this.errors.length > 0) {
      
      if (_.isUndefined(this.$errors)) {
        this.$errors = $("<div>", {
          'class': this.baseCSS("errors"),
          html: "<p>You have the following errors: </p><ul></ul>"
        });
        this.$outer.prepend(this.$errors);
      }
      
      var list = this.$errors.find('ul');
      
      _.each(this.errors, _.bind(function(error) {
        list.append($("<li>", {
          'class': this.baseCSS("error-msg"),
          html: error.text
        }));
      }, this));
      
      this.$errors.show();
    }
  },
  
  removeErrors: function() {
    if (this.errors.length > 0) {
      // We have old errors to remove
      this.$errors.find('ul').html(''); 
      this.$errors.hide();
      this.errors = [];
    }
  },
  
  /*
    Get Block Type Limit
    --
    returns the limit for this block, which can be set on a per Editor instance, or on a global blockType scope.
  */
  _getBlockTypeLimit: function(t) {
    if (this._blockTypeAvailable(t)) {
      return (_.isUndefined(this.options.blockTypeLimits[t])) ? SirTrevor.Blocks[t].prototype.limit : this.options.blockTypeLimits[t];
    }
    return 0;
  },
  
  /* 
    Availability helper methods
    --
    Checks if the object exists within the instance of the Editor.
  */
  _blockTypeAvailable: function(t) {
    return !_.isUndefined(this.blockTypes[t]);
  },
  
  _formatterAvailable: function(f) {
    return !_.isUndefined(this.formatters[f]);
  },
  
  _ensureAndSetElements: function() {
    if(_.isUndefined(this.options.el) || _.isEmpty(this.options.el)) {
      SirTrevor.log("You must provide an el");
      return false;
    }
     
    this.$el = this.options.el;
    this.el = this.options.el[0];
    this.$form = this.$el.parents('form');
    
    var blockCSSClass = this.baseCSS("blocks");

    // Wrap our element in lots of containers *eww*
    this.$el.wrap($('<div>', { id: this.ID, 'class': this.options.baseCSSClass, dropzone: 'copy link move' }))
            .wrap($("<div>", { 'class': blockCSSClass }));
      
    this.$outer = this.$form.find('#' + this.ID);
    this.$wrapper = this.$outer.find("." + blockCSSClass);

    return true;
  },
  
  
  /*
    Set our blockTypes and formatters.
    These will either be set on a per Editor instance, or set on a global scope.
  */
  _setBlocksAndFormatters: function() {
    this.blockTypes = flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.Blocks : this.options.blockTypes);
    this.formatters = flattern((_.isUndefined(this.options.formatters)) ? SirTrevor.Formatters : this.options.formatters);
  },
  
  /* Get our required blocks (if any) */
  _setRequired: function() {
    this.required = (_.isArray(this.options.required) && !_.isEmpty(this.options.required)) ? this.options.required : false;
  },
  
  /*
    A very generic HTML -> Markdown parser
    Looks for available formatters / blockTypes toMarkdown methods and calls these if they exist.
  */
  _toMarkdown: function(content, type) {

    var markdown;
    
    markdown = content.replace(/\n/mg,"")
                      .replace(/<a.*?href=[""'](.*?)[""'].*?>(.*?)<\/a>/g,"[$2]($1)")         // Hyperlinks
                      .replace(/<\/?b>/g,"**")
                      .replace(/<\/?STRONG>/g,"**")                   // Bold
                      .replace(/<\/?i>/g,"_")
                      .replace(/<\/?EM>/g,"_");                        // Italic

    // Use custom formatters toMarkdown functions (if any exist)
    var formatName, format;
    for(formatName in this.formatters) {
      if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
        format = SirTrevor.Formatters[formatName];
        // Do we have a toMarkdown function?
        if (!_.isUndefined(format.toMarkdown) && _.isFunction(format.toMarkdown)) {
          markdown = format.toMarkdown(markdown);
        }
      }
    }

    // Do our generic stripping out
    markdown = markdown.replace(/([^<>]+)(<div>)/g,"$1\n\n$2")                                 // Divitis style line breaks (handle the first line)
                   .replace(/(?:<div>)([^<>]+)(?:<div>)/g,"$1\n\n")                            // ^ (handle nested divs that start with content)
                   .replace(/(?:<div>)(?:<br>)?([^<>]+)(?:<br>)?(?:<\/div>)/g,"$1\n\n")        // ^ (handle content inside divs)
                   .replace(/<\/p>/g,"\n\n\n\n")                                               // P tags as line breaks
                   .replace(/<(.)?br(.)?>/g,"\n\n")                                            // Convert normal line breaks
                   .replace(/&nbsp;/g," ")                                                     // Strip white-space entities
                   .replace(/&lt;/g,"<").replace(/&gt;/g,">");                                 // Encoding

    
    // Use custom block toMarkdown functions (if any exist)
    var block;
    if (SirTrevor.Blocks.hasOwnProperty(type)) {
      block = SirTrevor.Blocks[type];
      // Do we have a toMarkdown function?
      if (!_.isUndefined(block.prototype.toMarkdown) && _.isFunction(block.prototype.toMarkdown)) {
        markdown = block.prototype.toMarkdown(markdown);
      }
    }
    
		// Strip remaining HTML
		markdown = markdown.replace(/<\/?[^>]+(>|$)/g, "");
    
    return markdown;
  },
  
  /*
    A very generic Markdown -> HTML parser
    Looks for available formatters / blockTypes toMarkdown methods and calls these if they exist.
  */
  _toHTML: function(markdown, type) {
    var html = markdown;
    
    // Use custom formatters toHTML functions (if any exist)
    var formatName, format;
    for(formatName in this.formatters) {
      if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
        format = SirTrevor.Formatters[formatName];
        // Do we have a toHTML function?
        if (!_.isUndefined(format.toHTML) && _.isFunction(format.toHTML)) {
          html = format.toHTML(html);
        }
      }
    }
    
    // Use custom block toHTML functions (if any exist)
    var block;
    if (SirTrevor.Blocks.hasOwnProperty(type)) {
			
      block = SirTrevor.Blocks[type];
      // Do we have a toHTML function?
      if (!_.isUndefined(block.prototype.toHTML) && _.isFunction(block.prototype.toHTML)) {
        html = block.prototype.toHTML(html);
      }
    }
    
    html =  html.replace(/^\> (.+)$/mg,"$1")                                       // Blockquotes
                .replace(/\n\n/g,"<br>")                                           // Give me some <br>s
                .replace(/\[([^\]]+)\]\(([^\)]+)\)/g,"<a href='$2'>$1</a>")        // Links
                .replace(/(?:_)([^*|_(http)]+)(?:_)/g,"<i>$1</i>")                 // Italic, avoid italicizing two links with underscores next to each other
                .replace(/(?:\*\*)([^*|_]+)(?:\*\*)/g,"<b>$1</b>");                // Bold
       
    return html;
  },

  baseCSS: function(additional) {
    return this.options.baseCSSClass + "-" + additional;
  }
});

