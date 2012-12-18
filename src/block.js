var Block = SirTrevor.Block = function(instance, data) {

  this.instance = instance;
  this.type = this._getBlockType();
  
  this.store("create", this, { data: data }); 
  
  //this.data = data;
  this.uploadsCount = 0;
  this.blockID = _.uniqueId(this.className + '-');
    
  this._setBaseElements();
  this._bindFunctions();
  
  this.render();
  
  this.initialize.apply(this, arguments);
};

var blockOptions = [
  "className", 
  "toolbarEnabled",
	"formattingEnabled",
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

_.extend(Block.prototype, FunctionBind, {
  
  bound: ["_handleDrop", "_handleContentPaste", "onBlockFocus", "onBlockBlur", "onDrop", "onDragStart", "onDragEnd"],
  
  $: function(selector) {
    return this.$el.find(selector);
  },
  
  $$: function(selector) {
    return this.$editor.find(selector);
  },
  
  /* Defaults to be overriden if required */
  className: '',
  title: '',
  limit: 0,
  editorHTML: '<div></div>',
  dropzoneHTML: '<div class="dropzone"><p>Drop content here</p></div>',
  toolbarEnabled: true,
  dropEnabled: false,
	formattingEnabled: true,
  
  initialize: function() {},
  
  loadData: function(data) {},
  onBlockRender: function(){},
  beforeBlockRender: function(){},
  toMarkdown: function(markdown){ return markdown; },
  toHTML: function(html){ return html; },
  
  store: function(){
    return SirTrevor.blockStore.apply(this, arguments);
  },
  
  render: function() {
    
    this.beforeBlockRender();
        
    // Insert before the marker
    this.instance.formatBar.hide();
    this.instance.marker.hide();
    this.instance.marker.$el.before(this.$el);
    
    // Do we have a dropzone? 
    if (this.dropEnabled) {
      this._initDragDrop();
    }
    
    // Has data already?
    var currentData = this.getData();
    
    if (!_.isUndefined(currentData) && !_.isEmpty(currentData)) {
      this._loadData();
    }
    
    // And save the state
    this.save();
    
    // Add UI elements
    this.$el.append($('<span>',{ 'class': 'handle', draggable: true }));
    this.$el.append($('<span>',{ 'class': 'delete block-delete' }));
    
    // Stop events propagating through to the container
    this.$el
      .bind('drop', halt)
      .bind('mouseover', halt)
      .bind('mouseout', halt)
      .bind('dragleave', halt)
      .bind('mouseover', function(ev){ $(this).siblings().removeClass('active'); $(this).addClass('active'); })
      .bind('mouseout', function(ev){ $(this).removeClass('active'); })
      .bind('dragover', function(ev){ ev.preventDefault(); });

    // Handle pastes
    this._initPaste();
    
    // Delete
    this.$('.delete.block-delete').bind('click', this.onDeleteClick);
    
    // Handle text blocks
    if (this.$$('.text-block').length > 0) {
      document.execCommand("styleWithCSS", false, false);
      document.execCommand("insertBrOnReturn", false, true);
      
      // Bind our text block to show the format bar
      this.$$('.text-block')
        .focus(this.onBlockFocus)
        .blur(this.onBlockBlur);
      
      // Strip out all the HTML on paste
      this.$$('.text-block').bind('paste', this._handleContentPaste);
      
      // Formatting
      this._initFormatting();
    }
    
    // Focus if we're adding an empty block, but only if not
		// the only block (i.e. page has just loaded a new editor)
    if (_.isEmpty(currentData.data) && this.instance.blocks.length > 0) {
      var inputs = this.$$('[contenteditable="true"], input');
      if (inputs.length > 0 && !this.dropEnabled) {
        inputs[0].focus();
      }
    }
    
    // Reorderable
    this._initReordering();
    
    this._initTextLimits();
    
    // Set ready state
    this.$el.addClass('sir-trevor-item-ready');
    
    this.onBlockRender();
  },
  
  remove: function() {
    this.$el.remove();
  },

  /* Save the state of this block onto the blocks data attr */
  save: function() {
    this.toData();
    return this.store("read", this);
  },
  
  getData: function() {
    return this.store("read", this).data;
  },
  
  setData: function(data) {
    SirTrevor.log("Setting data for block " + this.blockID);
    this.store("save", this, { data: data });
  },
  
  loading: function() {
    
    if(!_.isUndefined(this.spinner)) {
      this.ready();
    }
    
    this.spinner = new Spinner(this.instance.options.spinner);
    this.spinner.spin(this.$el[0]);
    
    this.$el.addClass('loading');
  },
  
  ready: function() {
    this.$el.removeClass('loading');
    if (!_.isUndefined(this.spinner)) {
      this.spinner.stop();
      delete this.spinner;
    }
  },
  
  /* Generic implementations */
  
  validate: function() {
    
    this._beforeValidate();
    
    var fields = this.$$('.required, [data-maxlength]'),
        errors = 0;
        
    _.each(fields, _.bind(function(field) {
      field = $(field);
      var content = (field.attr('contenteditable')) ? field.text() : field.val(),
          too_long = (field.attr('data-maxlength') && field.too_long()),
          required = field.hasClass('required');

      if ((required && content.length === 0) || too_long) {
        // Error!
        field.addClass(this.instance.options.errorClass).before($("<div>", {
          'class': 'error-marker',
          'html': '!'
        }));
        errors++;
      } 
    }, this));
    
    return (errors === 0);
  },
  
  /*
    Generic toData implementation.
    Can be overwritten, although hopefully this will cover most situations
  */
  toData: function() {
    
    SirTrevor.log("toData for " + this.blockID);
    
    var bl = this.$el,
        dataObj = {};
    
    /* Simple to start. Add conditions later */
    if (this.$$('.text-block').length > 0) {
      var content = this.$$('.text-block').html();
      if (content.length > 0) {
        dataObj.text = this.instance._toMarkdown(content, this.type);
      }
    }
    
    var hasTextAndData = (!_.isUndefined(dataObj.text) || this.$$('.text-block').length === 0);
    
    // Add any inputs to the data attr
    if(this.$$('input[type="text"]').not('.paste-block').length > 0) {
      this.$$('input[type="text"]').each(function(index,input){
        input = $(input);
        if (input.val().length > 0 && hasTextAndData) {
          dataObj[input.attr('name')] = input.val();
        }
      });
    }
    
    this.$$('select').each(function(index,input){
      input = $(input);
      if(input.val().length > 0 && hasTextAndData) {
        dataObj[input.attr('name')] = input.val();
      }
    });
    
    this.$$('input[type="file"]').each(function(index,input) {
      input = $(input);
      dataObj.file = input.data('json');
    });
    
    // Set
    if(!_.isEmpty(dataObj)) {
      this.setData(dataObj);
    }
  },
  
  /*
  * Event handlers
  */
  
  onDrop: function(dataTransferObj) {},

  onDragStart: function(ev){
    var item = $(ev.target);
    ev.originalEvent.dataTransfer.setDragImage(item.parent()[0], 13, 25);
    ev.originalEvent.dataTransfer.setData('Text', item.parent().attr('id'));
    item.parent().addClass('dragging');
    this.instance.formatBar.hide();
  },
  
  onDragEnd: function(ev){
    var item = $(ev.target);
    item.parent().removeClass('dragging');
    this.instance.marker.hide();
  },
  
  onBlockFocus: function(ev) {
    _.delay(_.bind(function(){
      this.instance.formatBar.clicked = false;
      if(this.formattingEnabled) {
				this.instance.formatBar.show(this.$el);
			}
    }, this), 250);
  },
  
  onBlockBlur: function(ev) {
    _.delay(_.bind(function(){
        if(!this.instance.formatBar.clicked && this.formattingEnabled) {
          this.instance.formatBar.hide();
        }
    }, this), 250);
  },
  
  onDeleteClick: function(ev) {
    if (confirm('Are you sure you wish to delete this content?')) {
      this.instance.removeBlock(this);
      halt(ev);
    }
  },
  
  onContentPasted: function(ev){
    var textBlock = this.$$('.text-block');
    if (textBlock.length > 0) {
      textBlock.html(this.instance._toHTML(this.instance._toMarkdown(textBlock.html(), this.type),this.type));
    }
  },
  
  /*
    Generic Upload Attachment Function
    Designed to handle any attachments
  */
  
  uploader: function(file, callback){
    SirTrevor.fileUploader(this, file, callback);
  },
  
  /* Private methods */
  
  _loadData: function() {
    
    SirTrevor.log("loadData for " + this.blockID);
    
    this.loading();
    
    if(this.dropEnabled) {
      this.$dropzone.hide();
      this.$editor.show();
    }
    
    SirTrevor.publish("editor/block/loadData");
    
    this.loadData(this.getData());
    this.ready();
  },
  
  _beforeValidate: function() {
    this.errors = []; 
    this.$('.error').removeClass('error');
    this.$('.error-marker').remove();
  },
  
  _handleContentPaste: function(ev) {
    // We need a little timeout here
    var timed = function(ev){ 
      // Delegate this off to the super method that can be overwritten
      this.onContentPasted(ev);
    };
    _.delay(_.bind(timed, this, ev), 100);
  },
  
  _handleDrop: function(e) {
    
    e.preventDefault();
    e = e.originalEvent;
    
    SirTrevor.publish("editor/block/handleDrop");
  
    var el = $(e.target),
        types = e.dataTransfer.types,
        type, data = [];
    
    this.instance.formatBar.hide();
    this.instance.marker.hide();
    this.$dropzone.removeClass('dragOver');
        
    /*
      Check the type we just received,
      delegate it away to our blockTypes to process
    */    
    
    if (!_.isUndefined(types))
    {
      if (_.include(types, 'Files') || _.include(types, 'text/plain') || _.include(types, 'text/uri-list')) 
      {
        this.onDrop(e.dataTransfer);
      } 
    }
  },

  _setBaseElements: function(){
    var el = (_.isFunction(this.editorHTML)) ? this.editorHTML() : this.editorHTML;
    
    // Set
    var editor = $('<div>', {
      'class': 'block-editor ' + this.className + '-block',
      html: el
    });
    
    this.$el = $('<div>', { 
      'class': this.instance.options.baseCSSClass + "-block", 
      id: this.blockID,
      "data-type": this.type,
      "data-instance": this.instance.ID,
      html: editor
    });
    
    // Set our element references
    this.el = this.$el[0];
    this.$editor = editor;
  },
  
  _getBlockType: function() {
    var objName = "";
    for (var block in SirTrevor.Blocks) {
      if (SirTrevor.Blocks[block].prototype == Object.getPrototypeOf(this)) {
        objName = block;
      }
    } 
    return objName;
  },
  
  /*
  * Init functions for adding functionality
  *
  */
  
  _initDragDrop: function() {
    SirTrevor.log("Adding drag and drop capabilities for block " + this.blockID);
    
    this.$dropzone = $("<div>", {
      html: this.dropzoneHTML,
      class: "dropzone " + this.className + '-block'
    });
    this.$el.append(this.$dropzone);
    this.$editor.hide();
    
    // Bind our drop event
    this.$dropzone.dropArea();
    this.$dropzone.bind('drop', this._handleDrop);
  },
  
  _initReordering: function() {
    this.$('.handle')
      .bind('dragstart', this.onDragStart)
      .bind('dragend', this.onDragEnd)
      .bind('drag', this.instance.marker.show);
  },
  
  _initFormatting: function() {
    // Enable formatting keyboard input
    var formatter;
    for (var name in this.instance.formatters) {
      if (this.instance.formatters.hasOwnProperty(name)) {
        formatter = SirTrevor.Formatters[name];
        if (!_.isUndefined(formatter.keyCode)) {
          formatter._bindToBlock(this.$editor);
        }
      }
    }
  },
  
  _initPaste: function() {
    this.$('.paste-block')
      .bind('click', function(){ $(this).select(); })
      .bind('paste', this._handleContentPaste)
      .bind('submit', this._handleContentPaste);
  },
  
  _initTextLimits: function() {
    this.$$('input[maxlength!=-1][maxlength!=524288][maxlength!=2147483647]').limit_chars();
  }
    
});

Block.extend = extend; // Allow our Block to be extended.
