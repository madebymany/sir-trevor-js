SirTrevor.Block = (function(){

  var Block = function(data, instance_id) {
    this.store("create", this, { data: data || {} });
    this.blockID = _.uniqueId('st-block-');
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
    "onTextContentPasted",
    "onBlockRender",
    "beforeBlockRender",
    "toMarkdown",
    "toHTML"
  ];

  var delete_template = [
    "<div class='st-block__ui-delete-controls'>",
      "<label class='st-block__delete-label'>Delete?</label>",
      "<a class='st-block-ui-btn st-block-ui-btn--confirm-delete st-icon' data-icon='tick'></a>",
      "<a class='st-block-ui-btn st-block-ui-btn--deny-delete st-icon' data-icon='close'></a>",
    "</div>"
  ].join("\n");

  SirTrevor.DEFAULTS.default_drop_options = {
    uploadable: false,
    pastable: false,
    re_render_on_reorder: false,
    drop_html: '<div class="st-block__dropzone"><span class="st-icon"><%= icon_name() %></span><p>Drag <span><%= type %></span> here</p></div>',
    upload_html: '<div class="st-block__upload-container"><input type="file" type="st-file-upload" /><button class="st-upload-btn">...or choose a file</button></div>',
    paste_html: '<input type="text" placeholder="Or paste URL here" class="st-block__paste-input st-paste-block">'
  };

  _.extend(Block.prototype, FunctionBind, SirTrevor.Events, Renderable, {

    bound: ["_handleDrop", "_handleContentPaste", "_onFocus", "_onBlur", "onDrop", "onDeleteClick"],

    className: 'st-block st-icon--add',

    block_template: _.template(
      "<div class='st-block__inner'><%= editor_html %></div>"
    ),

    drop_options: SirTrevor.DEFAULTS.default_drop_options,

    attributes: function() {
      return {
        'id': this.blockID,
        'data-type': this.type,
        'data-instance': this.instanceID,
        'data-icon-after' : "add"
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
      this.blockCSSClass = _.to_slug(this.type);
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

    loadData: function() {},
    onBlockRender: function(){},
    beforeBlockRender: function(){},
    toMarkdown: function(markdown){ return markdown; },
    toHTML: function(html){ return html; },

    store: function(){ return SirTrevor.blockStore.apply(this, arguments); },

    _loadAndSetData: function() {
      var currentData = this.getData();
      if (!_.isUndefined(currentData) && !_.isEmpty(currentData)) {
        this._loadData();
      }
    },

    withMixin: function(mixin) {
      if (!_.isObject(mixin)) { return; }
      _.extend(this, mixin);
      this["initialize" + mixin.mixinName]();
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

      if (this.hasTextBlock) { this._initTextBlocks(); }
      if (this.droppable) { this.withMixin(SirTrevor.BlockMixins.Droppable); }
      if (this.formattingEnabled) { this._initFormatting(); }

      this._loadAndSetData();

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
      this.store("save", this, { data: _.extend(this.dataStore.data, data) });
    },

    loading: function() {
      if(!_.isUndefined(this.spinner)) { this.ready(); }

      this.spinner = new Spinner(SirTrevor.DEFAULTS.spinner);
      this.spinner.spin(this.$el[0]);

      this.$el.addClass('st--is-loading');
    },

    ready: function() {
      this.$el.removeClass('st--is-loading');
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
          if (hasTextAndData) {
            dataObj[input.attr('name')] = input.val();
          }
        });
      }

      // this.$$('select').each(function(index,input){
      //   input = $(input);
      //   if(input.val().length > 0 && hasTextAndData) {
      //     dataObj[input.attr('name')] = input.val();
      //   }
      // });

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
      this.trigger('blockFocus', this.$el);
    },

    _onBlur: function() {},

    onDrop: function(dataTransferObj) {},

    onDeleteClick: function(ev) {
      ev.preventDefault();

      this.$inner.append(delete_template);
      this.$el.addClass('st-block--delete-active');

      var $delete_el = this.$inner.find('.st-block__ui-delete-controls');

      var onDeleteConfirm = function(e) {
        e.preventDefault();
        this.trigger('removeBlock', this.blockID);
      };

      var onDeleteDeny = function(e) {
        e.preventDefault();
        this.$el.removeClass('st-block--delete-active');
        $delete_el.remove();
      };

      this.$inner.on('click', '.st-block-ui-btn--confirm-delete', _.bind(onDeleteConfirm, this))
                 .on('click', '.st-block-ui-btn--deny-delete', _.bind(onDeleteDeny, this));
    },

    onTextContentPasted: function(target, before, event){
      var after = target[0].innerHTML;

      var pos1 = -1,
          pos2 = -1,
          after_len = after.length,
          before_len = before.length;

      for (var i = 0; i < after_len; i++) {
        if (pos1 == -1 && before.substr(i, 1) != after.substr(i, 1)) {
          pos1 = i - 1;
        }

        if (pos2 == -1 &&
            before.substr(before_len - i - 1, 1) !=
            after.substr(after_len - i - 1, 1)
          ) {
          pos2 = i;
        }
      }

      var pasted = after.substr(pos1, after_len - pos2 - pos1 + 1);

      var replace = SirTrevor.toHTML(SirTrevor.toMarkdown(pasted, this.type), this.type);

      // replace the HTML mess with the plain content
      target[0].innerHTML = after.substr(0, pos1) + replace + after.substr(pos1 + pasted.length);
    },

    onContentPasted: function(event, target){},

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
        this.$editor.show();
        this.$dropzone.hide();
      }

      SirTrevor.EventBus.trigger("editor/block/loadData");

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
      var target = $(ev.currentTarget),
          original_content = target.html();

      if (target.hasClass('st-text-block')) {
        _.delay(_.bind(this.onTextContentPasted, this, target, original_content, ev), 0);
      } else {
        _.delay(_.bind(this.onContentPasted, this, ev, target), 0);
      }
    },

    _getBlockClass: function() {
      return 'st-block--' + this.className;
    },

    /*
    * Init functions for adding functionality
    */

    _initUIComponents: function() {
      var ui_element = $("<div>", { 'class': 'st-block__ui' });

      this.$inner.append(ui_element);
      this.$ui = ui_element;

      var positioner = new SirTrevor.BlockPositioner(this.$el, this.instanceID),
          reorder = new SirTrevor.BlockReorder(this.$el);

      this.$ui.append(reorder.render().$el);
      this.$ui.append(new SirTrevor.BlockDeletion().render().$el);
      this.$ui.append(positioner.render().$el);

      this.$ui.on('click', '.st-block-ui-btn--delete', this.onDeleteClick);
      this.$ui.on('click', '.st-block-ui-btn--reorder', positioner.toggle);

      this.onFocus();
      this.onBlur();
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
      var shift_down = false;

      this.$$('.st-text-block')
        .bind('paste', this._handleContentPaste)
        .bind('keydown', function(e){
          var code = (e.keyCode ? e.keyCode : e.which);
          if (code == 16) shift_down = true;
        })
        .bind('keyup', _.bind(function(e){
          var code = (e.keyCode ? e.keyCode : e.which);

          if (shift_down && (code == 37 || code == 39 || code == 40 || code == 38)) {
            this.getSelectionForFormatter();
          }

          if (code == 16) {
            shift_down = false;
          }

        }, this))
        .bind('mouseup', this.getSelectionForFormatter);
    },

    getSelectionForFormatter: function() {
      var range = window.getSelection().getRangeAt(0),
          rects = range.getClientRects();

      if (!range.collapsed && rects.length) {
        SirTrevor.EventBus.trigger('formatter:positon', rects);
      } else {
        SirTrevor.EventBus.trigger('formatter:hide');
      }
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

  return Block;

})();