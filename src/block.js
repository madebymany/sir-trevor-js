var Block = SirTrevor.Block = function(data, instance_id) {
  this.store("create", this, { data: data || {} });
  this.blockID = _.uniqueId(this.className + '-');
  this.instanceID = instance_id;

  this._ensureElement();
  this._bindFunctions();

  this.initialize.apply(this, arguments);
};

var blockOptions = [
  "type",
  "toolbarEnabled",
	"formattingEnabled",
  "droppable",
  "drop_options",
  "validationFailMsg",
  "title",
  "editorHTML",
  "dropzoneHTML",
  "validate",
  "loadData",
  "toData",
  "onDrop",
  "onContentPasted",
  "onBlockRender",
  "beforeBlockRender",
  "setTextLimit",
  "toMarkdown",
  "toHTML"
];

var default_drop_options = {
  uploadable: false,
  pastable: false,
  drop_html: '<div class="st-block__dropzone"><span class="st-icon"><%= icon_name() %></span><p>Drag <span><%= type %></span> here</p></div>',
  upload_html: '<div class="st-block__upload-container"><input type="file" type="st-file-upload" /><button class="st-upload-btn">...or choose a file</button></div>',
  paste_html: '<input type="text" placeholder="Or paste URL here" class="st-block__paste-input st-paste-block">'
};

_.extend(Block.prototype, FunctionBind, Events, Renderable, {

  bound: ["_handleDrop", "_handleContentPaste", "_onFocus", "_onBlur", "onDrop", "onDrag", "onDragStart", "onDragEnd"],

  className: 'st-block',
  block_template: _.template(
    "<div class='st-block__inner'><%= editor_html %></div>"
  ),

  attributes: function() {
    return {
      'id': this.blockID,
      'data-type': this.type,
      'data-instance': this.instanceID
    };
  },

  title: function() {
    return _.capitalize(this.type);
  },

  icon_name: function() {
    return this.type.toLowerCase();
  },

  blockCSSClass: function() {
    // Memoize the slug.
    this.blockCSSClass = toSlug(this.type);
    return this.blockCSSClass;
  },

  validationFailMsg: function() {
    return this.type + ' block is invalid';
  },

  $$: function(selector) {
    return this.$el.find(selector);
  },

  /* Defaults to be overriden if required */
  type: '',
  editorHTML: '<div class="st-block__editor"></div>',

  toolbarEnabled: true,

  droppable: false,
  formattable: true,

	formattingEnabled: true,

  uploadsCount: 0,

  initialize: function() {},

  loadData: function(data) {},
  onBlockRender: function(){},
  beforeBlockRender: function(){},
  setTextLimit: function() {},
  toMarkdown: function(markdown){ return markdown; },
  toHTML: function(html){ return html; },

  store: function(){ return SirTrevor.blockStore.apply(this, arguments); },

  _loadAndSetData: function() {
    var currentData = this.getData();
    if (!_.isUndefined(currentData) && !_.isEmpty(currentData)) {
      this._loadData();
    }
  },

  render: function() {
    this.beforeBlockRender();

    var editor_html = _.result(this, 'editorHTML');

    this.$el.append(
      this.block_template({ editor_html: editor_html })
    );

    this.$inner = this.$el.find('.st-block__inner');
    this.$editor = this.$inner.children().first();

    this.$inner.bind('click mouseover', function(e){ e.stopPropagation(); });

    this._loadAndSetData();

    if (this.hasTextBlock) { this._initTextBlocks(); }
    if (this.droppable) { this._initDroppable(); }
    if (this.formattingEnabled) { this._initFormatting(); }

    this._initUIComponents();
    this._initPaste();

    this.$el.addClass('st-item-ready');
    this.save();

    this.onBlockRender();

    return this;
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
    if(!_.isUndefined(this.spinner)) { this.ready(); }

    this.spinner = new Spinner(SirTrevor.DEFAULTS.spinner);
    this.spinner.spin(this.$el[0]);

    this.$el.addClass('st-loading');
  },

  ready: function() {
    this.$el.removeClass('st-loading');
    if (!_.isUndefined(this.spinner)) {
      this.spinner.stop();
      delete this.spinner;
    }
  },

  /* Generic implementations */

  validate: function() {
    this._beforeValidate();

    var fields = this.$$('.st-required, [data-maxlength]'),
        errors = 0;

    _.each(fields, _.bind(function(field) {
      field = $(field);
      var content = (field.attr('contenteditable')) ? field.text() : field.val(),
          too_long = (field.attr('data-maxlength') && field.too_long()),
          required = field.hasClass('st-required');

      if ((required && content.length === 0) || too_long) {
        // Error!
        field.addClass('st-error');
        errors++;
      }
    }, this));

    if (errors > 0) {
      this.$el.addClass('st-block--with-errors');
    }

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
    if (this.$$('.st-text-block').length > 0) {
      var content = this.$$('.st-text-block').html();
      if (content.length > 0) {
        dataObj.text = SirTrevor.toMarkdown(content, this.type);
      }
    }

    var hasTextAndData = (!_.isUndefined(dataObj.text) || this.$$('.st-text-block').length === 0);

    // Add any inputs to the data attr
    if(this.$$('input[type="text"]').not('.st-paste-block').length > 0) {
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

  /* Generic implementation to tell us when the block is active */
  focus: function() {
    this.$('.st-text-block').focus();
  },

  blur: function() {
    this.$('.st-text-block').blur();
  },

  onFocus: function() {
    this.$('.st-text-block').bind('focus', this._onFocus);
  },

  onBlur: function() {
    this.$('.st-text-block').bind('blur', this._onBlur);
  },

  /*
  * Event handlers
  */

  _onFocus: function() {
    this.$el.addClass('st-block--active');
    this.trigger('blockFocus', this.$el);
  },

  _onBlur: function() {
    //this.$el.removeClass('st-block--active');
  },

  onDrop: function(dataTransferObj) {},

  onDrag: function(ev){},

  onDragStart: function(ev){
    var item = $(ev.target),
        block = item.parents('.st-block');

    ev.originalEvent.dataTransfer.setDragImage(block[0], 0, 0);
    ev.originalEvent.dataTransfer.setData('Text', block.attr('id'));

    block.addClass('st-block--dragging');
  },

  onDragEnd: function(ev){
    var item = $(ev.target),
        block = item.parents('.st-block');

    block.removeClass('st-block--dragging');
  },

  onDeleteClick: function(ev) {
    if (confirm('Are you sure you wish to delete this content?')) {
      this.remove();
      this.trigger('removeBlock', this.blockID, this.type);
      halt(ev);
    }
  },

  onContentPasted: function(ev){
    var textBlock = this.$$('.st-text-block');
    if (textBlock.length > 0) {
      textBlock.html(SirTrevor.toHTML(SirTrevor.toMarkdown(textBlock.html(), this.type), this.type));
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

    if(this.droppable) {
      this.$dropzone.hide();
    }

    SirTrevor.publish("editor/block/loadData");

    this.loadData(this.getData());
    this.ready();
  },

  _beforeValidate: function() {
    this.errors = [];
    var errorClass = 'st-error';
    this.$el.removeClass('st-block--with-errors');
    this.$('.' + errorClass).removeClass(errorClass);
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

    this.$dropzone.removeClass('st-dropzone--dragover');

    /*
      Check the type we just received,
      delegate it away to our blockTypes to process
    */

    if (!_.isUndefined(types)) {
      if (_.include(types, 'Files') || _.include(types, 'text/plain') || _.include(types, 'text/uri-list')) {
        this.onDrop(e.dataTransfer);
      }
    }
  },

  _getBlockClass: function() {
    return 'st-block--' + this.className;
  },

  /*
  * Init functions for adding functionality
  */

  _initDroppable: function() {
    SirTrevor.log("Adding drag and drop capabilities for block " + this.blockID);

    var drop_options = _.extend(default_drop_options, this.drop_options);

    // Build the dropzone interface
    var drop_html = $(_.template(drop_options.drop_html, this));

    if (this.drop_options.pastable) {
      drop_html.append(drop_options.paste_html);
    }

    if (this.drop_options.uploadable) {
      drop_html.append(drop_options.upload_html);
    }

    this.$inner.append(drop_html);
    this.$dropzone = drop_html;

    // Bind our drop event
    this.$dropzone.bind('drop', this._handleDrop)
                  .bind('dragenter', function(e) { halt(e); $(this).addClass('st-dropzone--dragover'); })
                  .bind('dragover', function(e) {
                    e.originalEvent.dataTransfer.dropEffect = "copy"; halt(e);
                    $(this).addClass('st-dropzone--dragover');
                  })
                  .bind('dragleave', function(e) { halt(e); $(this).removeClass('st-dropzone--dragover'); });
  },

  _initUIComponents: function() {
    var ui_element = $("<div>", { 'class': 'st-block__ui' });
    this.$inner.append(ui_element);
    this.$ui = ui_element;

    this.onFocus();
    this.onBlur();

    this._initReordering();
    this._initDeletion();
  },

  _initReordering: function() {
    var reorder_element = $('<a>', { 'class': 'st-block__reorder st-icon', 'html': 'reorder', 'draggable': 'true' });

    this.$ui.append(reorder_element);

    reorder_element
      .bind('dragstart', this.onDragStart)
      .bind('dragend', this.onDragEnd)
      .bind('drag', this.onDrag);

    this.$el
      .bind('drop', halt)
      .bind('dragleave', halt)
      .bind('dragover', function(ev){ ev.preventDefault(); });
  },

  _initDeletion: function() {
    var delete_el = $('<a>',{ 'class': 'st-block__remove st-icon', 'html': 'delete' });
    this.$ui.append(delete_el);
    delete_el.bind('click', this.onDeleteClick);
  },

  _initFormatting: function() {
    // Enable formatting keyboard input
    var formatter;
    for (var name in SirTrevor.Formatters) {
      if (SirTrevor.Formatters.hasOwnProperty(name)) {
        formatter = SirTrevor.Formatters[name];
        if (!_.isUndefined(formatter.keyCode)) {
          formatter._bindToBlock(this.$el);
        }
      }
    }
  },

  _initTextBlocks: function() {
    document.execCommand("styleWithCSS", false, false);
    document.execCommand("insertBrOnReturn", false, true);

    this.$$('.st-text-block')
      .bind('paste', this._handleContentPaste);
  },

  hasTextBlock: function() {
    return this.$('.st-text-block').length > 0;
  },

  _initPaste: function() {
    this.$('.st-paste-block')
      .bind('click', function(){ $(this).select(); })
      .bind('paste', this._handleContentPaste)
      .bind('submit', this._handleContentPaste);
  }
});

Block.extend = extend; // Allow our Block to be extended.
