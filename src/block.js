SirTrevor.Block = (function(){

  var Block = function(data, instance_id) {
    SirTrevor.SimpleBlock.apply(this, arguments);
  };

  var delete_template = [
    "<div class='st-block__ui-delete-controls'>",
      "<label class='st-block__delete-label'>Delete?</label>",
      "<a class='st-block-ui-btn st-block-ui-btn--confirm-delete st-icon' data-icon='tick'></a>",
      "<a class='st-block-ui-btn st-block-ui-btn--deny-delete st-icon' data-icon='close'></a>",
    "</div>"
  ].join("\n");

  var drop_options = {
    html: ['<div class="st-block__dropzone">',
           '<span class="st-icon"><%= icon_name() %></span>',
           '<p>Drag <span><%= type %></span> here</p></div>'].join('\n'),
    re_render_on_reorder: false
  };

  var paste_options = {
    html: '<input type="text" placeholder="Or paste URL here" class="st-block__paste-input st-paste-block">'
  };

  var upload_options = {
    html: [
      '<div class="st-block__upload-container">',
      '<input type="file" type="st-file-upload">',
      '<button class="st-upload-btn">...or choose a file</button>',
      '</div>'
    ].join('\n')
  };

  SirTrevor.DEFAULTS.Block = {
    drop_options: drop_options,
    paste_options: paste_options,
    upload_options: upload_options
  };

  _.extend(Block.prototype, SirTrevor.SimpleBlock.fn, {

    bound: ["_handleDrop", "_handleContentPaste", "_onFocus", "_onBlur", "onDrop", "onDeleteClick", "clearInsertedStyles"],

    className: 'st-block st-icon--add',

    attributes: function() {
      return _.extend(SirTrevor.SimpleBlock.fn.attributes.call(this), {
        'data-icon-after' : "add"
      });
    },

    icon_name: function() {
      return this.type.toLowerCase();
    },

    validationFailMsg: function() {
      return this.type + ' block is invalid';
    },

    editorHTML: '<div class="st-block__editor"></div>',

    toolbarEnabled: true,

    droppable: false,
    pastable: false,
    uploadable: false,

    drop_options: {},
    paste_options: {},
    upload_options: {},

    formattable: true,

    toMarkdown: function(markdown){ return markdown; },

    withMixin: function(mixin) {
      if (!_.isObject(mixin)) { return; }
      _.extend(this, mixin);
      this["initialize" + mixin.mixinName]();
    },

    render: function() {
      this.beforeBlockRender();

      this._setBlockInner();

      this.$editor = this.$inner.children().first();

      if(this.droppable || this.pastable || this.uploadable) {
        var input_html = $("<div>", { 'class': 'st-block__inputs' });
        this.$inner.append(input_html);
        this.$inputs = input_html;
      }

      if (this.hasTextBlock) { this._initTextBlocks(); }
      if (this.droppable) { this.withMixin(SirTrevor.BlockMixins.Droppable); }
      if (this.pastable) { this.withMixin(SirTrevor.BlockMixins.Pastable); }
      if (this.uploadable) { this.withMixin(SirTrevor.BlockMixins.Uploadable); }

      if (this.formattable) { this._initFormatting(); }

      this._loadAndSetData();
      this._initUI();

      this.$el.addClass('st-item-ready');
      this.save();

      this.onBlockRender();

      return this;
    },

    /* Save the state of this block onto the blocks data attr */
    save: function() {
      this.toData();
      return SirTrevor.SimpleBlock.fn.save.call(this);
    },

    remove: function() {
      this.$el.remove();
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
      if (this.hasTextBlock()) {
        var content = this.getTextBlock().html();
        if (content.length > 0) {
          dataObj.text = SirTrevor.toMarkdown(content, this.type);
        }
      }

      var hasTextAndData = (!_.isUndefined(dataObj.text) || !this.hasTextBlock());

      // Add any inputs to the data attr
      if(this.$$('input[type="text"]').not('.st-paste-block').length > 0) {
        this.$$('input[type="text"]').each(function(index,input){
          input = $(input);
          if (hasTextAndData) {
            dataObj[input.attr('name')] = input.val();
          }
        });
      }

      // Set
      if(!_.isEmpty(dataObj)) {
        this.setData(dataObj);
      }
    },

    /* Generic implementation to tell us when the block is active */
    focus: function() {
      this.getTextBlock().focus();
    },

    blur: function() {
      this.getTextBlock().blur();
    },

    onFocus: function() {
      this.getTextBlock().bind('focus', this._onFocus);
    },

    onBlur: function() {
      this.getTextBlock().bind('blur', this._onBlur);
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

      this.loading();

      if(this.droppable || this.uploadable || this.pastable) {
        this.$editor.show();
        this.$inputs.hide();
      }

      SirTrevor.SimpleBlock.fn._loadData.call(this);

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

    /*
    * Init functions for adding functionality
    */

    _initUIComponents: function() {

      var positioner = new SirTrevor.BlockPositioner(this.$el, this.instanceID);

      this._withUIComponent(
        positioner, '.st-block-ui-btn--reorder', positioner.toggle
      );

      this._withUIComponent(
        new SirTrevor.BlockReorder(this.$el)
      );

      this._withUIComponent(
        new SirTrevor.BlockDeletion(), '.st-block-ui-btn--delete', this.onDeleteClick
      );

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

      this.getTextBlock()
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
        .bind('mouseup', this.getSelectionForFormatter)
        .on('DOMNodeInserted', this.clearInsertedStyles);
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

    clearInsertedStyles: function(e) {
      e.target.removeAttribute('style'); // Hacky fix for Chrome.
    },

    hasTextBlock: function() {
      return this.getTextBlock().length > 0;
    },

    getTextBlock: function() {
      if (_.isUndefined(this.text_block)) {
        this.text_block = this.$('.st-text-block');
      }

      return this.text_block;
    }

  });

  Block.extend = extend; // Allow our Block to be extended.

  return Block;

})();