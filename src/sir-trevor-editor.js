/*
  Sir Trevor Editor
  -- 
  Represents one Sir Trevor editor instance (with multiple blocks)
  Each block references this instance. 
  BlockTypes are global however.
*/

var SirTrevorEditor = SirTrevor.Editor = function(options) {
  
  this.blockTypes = {};
  this.formatters = {};
  this.blockCounts = {}; // Cached block type counts
  this.blocks = []; // Block references
  this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
  this.ID = _.uniqueId(this.options.baseCSSClass + "-");
  
  if (this._ensureAndSetElements()) {
    
    this.marker = new SirTrevor.Marker(this.options.marker, this);
    this.formatBar = new SirTrevor.FormatBar(this.options.formatBar, this);
    
    this._setBlocksAndFormatters();
    this._bindFunctions();
    this.from_json();
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
    
    if (this.options.blockStore.data.length === 0) {
      // Create a default instance
      this.createBlock(this.options.defaultType);
    } else {
      // We have data. Build our blocks from here.
      _.each(this.options.blockStore.data, _.bind(function(block){
        this.createBlock(block.type, block.data);
      }, this));
    }
        
    this.$wrapper.addClass('sir-trevor-ready');
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
     if (currentBlockCount > blockTypeLimit || this.options.blockLimit !== 0 && totalBlockCounts >= this.options.blockLimit) {
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
      
     if (currentBlockCount >= blockTypeLimit) {
       this.marker.$el.find('[data-type="' + type + '"]')
        .addClass('inactive')
        .attr('title','You have reached the limit for this type of block');
     } 
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
    this.formatBar.hide();
    
    // Remove our inactive class if it's no longer relevant
    if(this._getBlockTypeLimit(block.type) > this.blockCounts[block.type]) {
      this.marker.$el.find('[data-type="' + block.type + '"]')
        .removeClass('inactive')
        .attr('title','Add a ' + block.type + ' block');
    }
  },
  
  /*
    Handle a form submission of this Editor instance.
    Validate all of our blocks, and serialise all data onto the JSON objects
  */
  onFormSubmit: function() {
    
    var blockLength, block, result, errors = 0;

    this.options.blockStore.data = [];
    
    // Loop through blocks to validate
    var blockIterator = function(block,index) {
      // Find our block
      block = $(block);
      var _block = _.find(this.blocks, function(b){ return (b.blockID == block.attr('id')); });
      
      if (!_.isUndefined(_block) || !_.isEmpty(_block) || typeof _block == SirTrevor.Block) {
        // Validate our block
        if(_block.validate())
        {
          var data = _block.save();
          if(!_.isEmpty(data.data)) {
            this.options.blockStore.data.push(data);
          }
        } else errors++;
      }
      
    };
    _.each(this.$wrapper.find('.' + this.options.baseCSSClass + "-block"), _.bind(blockIterator, this));

    // Empty or JSON-ify
    this.$el.val((this.options.blockStore.data.length === 0) ? '' : this.to_json());
    return errors;
  },
  
  /*
    Turn our JSON blockStore into a string
  */  
  to_json: function() {
    return JSON.stringify(this.options.blockStore);
  },
  
  /* 
    Try and load our data from the defined element.
    Store it on our blockStore property for later re-use.
  */
  from_json: function() {
    var content = this.$el.val();
    this.options.blockStore = { data: [] };
    
    if (content.length > 0) {
      try{
        
        // Ensure the JSON string has a data element that's an array
        var str = JSON.parse(content);
        
        if (!_.isUndefined(str.data) && (_.isArray(str.data) && !_.isEmpty(str.data))) {
          // Set it
          this.options.blockStore = str;
        } 
      } catch(e) {
        console.log('Sorry there has been a problem with parsing the JSON');
        console.log(e);
      }
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
      return false;
    }
     
    this.$el = this.options.el;
    this.el = this.options.el[0];
    this.$form = this.$el.parents('form');
    
    // Wrap our element in lots of containers *eww*
    this.$el.wrap($('<div>', { 
                    id: this.ID,
                    'class': this.options.baseCSSClass + " " + this.options.baseCSSClass + "_dragleave",
                    dropzone: 'copy link move'
                  })
                );
      
    this.$wrapper = this.$form.find('#' + this.ID); 
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
    
    // Use custom block toMarkdown functions (if any exist)
    var block;
    if (SirTrevor.Blocks.hasOwnProperty(type)) {
      block = SirTrevor.Blocks[type];
      // Do we have a toMarkdown function?
      if (!_.isUndefined(block.prototype.toMarkdown) && _.isFunction(block.prototype.toMarkdown)) {
        markdown = block.prototype.toMarkdown(markdown);
      }
    }
     
    // Do our generic stripping out
    markdown = markdown.replace(/([^<>]+)(<div>)/g,"$1\n\n$2")                                 // Divitis style line breaks (handle the first line)
                   .replace(/(?:<div>)([^<>]+)(?:<div>)/g,"$1\n\n")                            // ^ (handle nested divs that start with content)
                   .replace(/(?:<div>)(?:<br>)?([^<>]+)(?:<br>)?(?:<\/div>)/g,"$1\n\n")        // ^ (handle content inside divs)
                   .replace(/<\/p>/g,"\n\n\n\n")                                               // P tags as line breaks
                   .replace(/<(.)?br(.)?>/g,"\n\n")                                            // Convert normal line breaks
                   .replace(/&nbsp;/g," ")                                                     // Strip white-space entities 
                   .replace(/&lt;/g,"<").replace(/&gt;/g,">")                                  // Encoding
                   .replace(/<\/?[^>]+(>|$)/g, "");                                            // Strip remaining HTML
                   
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
        // Do we have a toMarkdown function?
        if (!_.isUndefined(format.toHTML) && _.isFunction(format.toHTML)) {
          html = format.toHTML(html);
        }
      }
    }
    
    // Use custom block toHTML functions (if any exist)
    var block;
    if (SirTrevor.Blocks.hasOwnProperty(type)) {
      block = SirTrevor.Blocks[type];
      // Do we have a toMarkdown function?
      if (!_.isUndefined(block.prototype.toHTML) && _.isFunction(block.prototype.toHTML)) {
        html = block.prototype.toHTML(html);
      }
    }
    
    html =  html.replace(/^\> (.+)$/mg,"$1")                                       // Blockquotes
                .replace(/\n\n/g,"<br>")                                           // Give me some <br>s
                .replace(/\[(.+)\]\((.+)\)/g,"<a href='$2'>$1</a>")                 // Links
                .replace(/(?:_)([^*|_]+)(?:_)/mg,"<i>$1</i>")                   // Italic
                .replace(/(?:\*\*)([^*|_]+)(?:\*\*)/mg,"<b>$1</b>");                // Bold
       
    return html;  
  }
});

