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
    
  }
};

_.extend(SirTrevorEditor.prototype, Events, {
  
  bound: ['onFormSubmit'],
  
  initialize: function() {},
  
  build: function() {
    
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
    this.attach();
  },
  
  attach: function() {
    this.$form.on('submit', this.onFormSubmit);
  },
  
  createBlock: function(type, data) {
    if (this._blockTypeAvailable(type)) {
      
     var blockType = SirTrevor.BlockTypes[type],
         currentBlockCount = (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type];
     
     // Can we have another one of these blocks?
     if (currentBlockCount > blockType.limit) {
       return false;
     }
     
     if (currentBlockCount + 1 > blockType.limit) {
       this.marker.$el.find('[data-type="' + type + '"]')
                  .addClass('inactive')
                  .attr('title','You have reached the limit for this type of block');
                  
       return false;            
     }
     
     var block = new SirTrevor.Block(this, blockType, data || {});  
     
     if (_.isUndefined(this.blockCounts[type])) {
       this.blockCounts[type] = 0;
     }
     
     this.blocks.push(block);
     this.blockCounts[type] = currentBlockCount + 1;
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
  },
  
  /* Handlers */
  
  onFormSubmit: function(e) {
    
    e.preventDefault();
    
    var blockLength, block, result;

    this.options.blockStore.data = [];
    
    // Loop through blocks to validate
    var blockIterator = function(block,index) {
      // Find our block
      block = $(block);
      var _block = _.find(this.blocks, function(b){ return (b.blockID == block.attr('id')); });
      
      if (_.isUndefined(_block) || _.isEmpty(_block) || typeof _block != SirTrevor.Block) {
        var data = _block.save();
        if(!_.isEmpty(data)) {
          this.options.blockStore.data.push(data);
        }
      }
      
    };
    _.each(this.$wrapper.find('.' + this.options.baseCSSClass + "-block"), _.bind(blockIterator, this));

    // Empty or JSON-ify
    this.$el.val((this.options.blockStore.data.length === 0) ? '' : this.to_json());
    return false;
  },
  
  /* Privates */
  
  to_json: function() {
    return JSON.stringify(this.options.blockStore);
  },
  
  from_json: function() {
    var content = this.$el.val();
    if (content.length > 0) {
      this.options.blockStore = JSON.parse(content);
    } else {
      this.options.blockStore.data = [];
    }
  },
  
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
    this.$el
      .wrap(
        $('<div>', { 
          'class': this.options.baseCSSClass
        })
      )
      .wrap(
        $('<div>', { 
          'class': this.options.baseCSSClass + "_dragleave"
        })
      )
      .wrap(
        $('<div>', {
          id: this.ID,
          'class': this.options.baseCSSClass + "_container",
          'style': 'padding: 20px;',
          dropzone: 'copy link move'
        })
      );
      
    this.$wrapper = this.$form.find('#' + this.ID); 
    return true;
  },
  
  _setBlocksAndFormatters: function() {
    this.blockTypes = flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.BlockTypes : this.options.blockTypes);
    this.formatters = flattern((_.isUndefined(this.options.formatters)) ? SirTrevor.Formatters : this.options.formatters);
  },
  
  _toMarkdown: function(content, type) {
    /* 
      Generic Markdown parser. Takes HTML and returns Markdown (obvs)
      This can be extended through your formatters.
    */
    
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
    if (SirTrevor.BlockTypes.hasOwnProperty(type)) {
      block = SirTrevor.BlockTypes[type];
      // Do we have a toMarkdown function?
      if (!_.isUndefined(block.toMarkdown) && _.isFunction(block.toMarkdown)) {
        markdown = block.toMarkdown(markdown);
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
    if (SirTrevor.BlockTypes.hasOwnProperty(type)) {
      block = SirTrevor.BlockTypes[type];
      // Do we have a toMarkdown function?
      if (!_.isUndefined(block.toHTML) && _.isFunction(block.toHTML)) {
        html = block.toHTML(html);
      }
    }
    
    html =  html.replace(/^\> (.+)$/mg,"$1")                                       // Blockquotes
                .replace(/\n\n/g,"<br>")                                           // Give me some <br>s
                .replace(/\[(.+)\]\((.+)\)/g,"<a href='$2'>$1</a>")                 // Links
                .replace(/(?:\*\*)([^*|_]+)(?:\*\*)/mg,"<b>$1</b>")                // Bold
                .replace(/(?:_)([^*|_]+)(?:_)/mg,"<i>$1</i>");                     // Italic
       
    return html;  
  }
});

