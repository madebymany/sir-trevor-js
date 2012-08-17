/*
  Generic Block Type Implementation
  --
  Designed to be extended in a Backbone way to create new instances.
  Lots of the properties / methods defined 
*/

var BlockType = SirTrevor.BlockType = function(options){
  this.instances = {};
  this.instanceCount = 0;
  this._configure(options || {});
  this.blockTypeID = _.uniqueId(this.className + '-');
  this.initialize.apply(this, arguments);
};

var blockTypeOptions = [
  "className", 
  "toolbarEnabled", 
  "dropEnabled", 
  "title", 
  "limit", 
  "editorHTML", 
  "dropzoneHTML", 
  "validate", 
  "loadData", 
  "toData",
  "onDrop",
  "onContentPasted",
  "onBlockRender",
  "beforeBlockRender",
  "toMarkdown",
  "toHTML"
];

_.extend(BlockType.prototype, {
  
  /* Defaults to be overriden if required */
  className: '',
  title: '',
  limit: 0,
  editorHTML: '<div></div>',
  dropzoneHTML: '<div class="dropzone"><p>Drop content here</p></div>',
  toolbarEnabled: true,
  dropEnabled: false,
  
  initialize: function() {},
  
  loadData: function(data) {},
  onBlockRender: function(){},
  beforeBlockRender: function(){},
  onBlockActivated: function(){},
  onDrop: function(transferData){},
  toMarkdown: function(markdown){ return markdown; },
  toHTML: function(html){ return html; },
    
  /*
    Generic toData implementation.
    Can be overwritten, although hopefully this will cover most situations
  */
  toData: function() {
    var bl = this.$el,
        dataStruct = bl.data('block'),
        content;
    
    /* Simple to start. Add conditions later */
    if (this.$('.text-block').length > 0) {
      content = this.$('.text-block').html();
      if (content.length > 0) {
        dataStruct.data.text = this.instance._toMarkdown(content, this.type);
      }
    }
    
    var hasTextAndData = (!_.isUndefined(dataStruct.data.text) || this.$('.text-block').length === 0);
    
    // Add any inputs to the data attr
    if(this.$('input[type="text"]').not('.paste-block').length > 0) {
      this.$('input[type="text"]').each(function(index,input){
        input = $(input);
        if (input.val().length > 0 && hasTextAndData) {
          dataStruct.data[input.attr('name')] = input.val();
        }
      });
    }
    
    this.$('select').each(function(index,input){
      input = $(input);
      if(input.val().length > 0 && hasTextAndData) {
        dataStruct.data[input.attr('name')] = input.val();
      }
    });
    
    this.$('input[type="file"]').each(function(index,input) {
      input = $(input);
      dataStruct.data.file = input.data('json');
    });
  },
  
  /*
    Generic validator
    --
    We look for 'required' properties on any fields / editable areas. 
    If we don't find any, then skip. If we do find some, then run validators against each of these.
  */
  
  validate: function() {
    var fields = this.$('.required'),
        errors = 0;
        
    _.each(fields, _.bind(function(field) {
      field = $(field);
      var content = (field.attr('contenteditable')) ? field.text() : field.val();
        
      if (content.length === 0) {
        // Error!
        field.addClass('error').before($("<div>", {
          'class': 'error-marker',
          'html': '!'
        }));
        errors++;
      } 
    }, this));
    
    return (errors === 0);
  },
  
  /*
    Generic onContentPasted that strips ALL HTML other than stuff we like from the block
  */
  onContentPasted: function(ev){
    var textBlock = this.$('.text-block');
    if (textBlock.length > 0) {
      textBlock.html(this.instance._toHTML(this.instance._toMarkdown(textBlock.html(), this.type)));
    }
  },
  
  /* Helper / convienience methods */
  
  blockType: function() {
    var objName = "";
    for (var block in SirTrevor.BlockTypes) {
      if (SirTrevor.BlockTypes[block] == this) {
        objName = block;
      }
    } 
    return objName;
  },
  
  /* Configure */
  
  _configure: function(options) {
    if (this.options) options = _.extend({}, this.options, options);
    for (var i = 0, l = blockTypeOptions.length; i < l; i++) {
      var attr = blockTypeOptions[i];
      if (options[attr]) this[attr] = options[attr];
    }
    this.options = options;
  }
  
});

BlockType.extend = extend; // Allow our BlockTypes to be extended.