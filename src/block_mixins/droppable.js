/* Adds drop functionaltiy to this block */

SirTrevor.BlockMixins.Droppable = {

  mixinName: "Droppable",
  valid_drop_file_types: ['File', 'Files', 'text/plain', 'text/uri-list'],

  initializeDroppable: function() {
    SirTrevor.log("Adding drag and drop capabilities for block " + this.blockID);

    this.drop_options = _.extend({}, SirTrevor.DEFAULTS.default_drop_options, this.drop_options);

    // Build the dropzone interface
    var drop_html = $(_.template(this.drop_options.drop_html, this));

    if (this.drop_options.pastable) {
      drop_html.append(this.drop_options.paste_html);
    }

    if (this.drop_options.uploadable) {
      drop_html.append(this.drop_options.upload_html);
    }

    this.$editor.hide();
    this.$inner.append(drop_html).addClass('st-block__inner--droppable');
    this.$dropzone = drop_html;

    // Bind our drop event
    this.$dropzone.dropArea()
                  .bind('drop', _.bind(this._handleDrop, this));
  },

  _handleDrop: function(e) {
    e.preventDefault();

    e = e.originalEvent;

    var el = $(e.target),
        types = e.dataTransfer.types,
        type, data = [];

    el.removeClass('st-dropzone--dragover');

    /*
      Check the type we just received,
      delegate it away to our blockTypes to process
    */

    if (!_.isUndefined(types) &&
      _.some(types, function(type){ return _.include(this.valid_drop_file_types, type); }, this)) {
      this.onDrop(e.dataTransfer);
    }

    SirTrevor.EventBus.trigger('block:content:dropped');
  }

};