/* Adds drop functionaltiy to this block */

SirTrevor.BlockMixins.Droppable = {

  name: "Droppable",

  initializeDroppable: function() {
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
    this.$dropzone.bind('drop', _.bind(this._handleDrop, this))
                  .bind('dragenter', function(e) { halt(e); $(this).addClass('st-dropzone--dragover'); })
                  .bind('dragover', function(e) {
                    e.originalEvent.dataTransfer.dropEffect = "copy"; halt(e);
                    $(this).addClass('st-dropzone--dragover');
                  })
                  .bind('dragleave', function(e) { halt(e); $(this).removeClass('st-dropzone--dragover'); });
  },

  _handleDrop: function(e) {
    e.preventDefault();
    e = e.originalEvent;

    SirTrevor.publish("editor/block/handleDrop");

    var el = $(e.target),
        types = e.dataTransfer.types,
        type, data = [];

    el.removeClass('st-dropzone--dragover');

    /*
      Check the type we just received,
      delegate it away to our blockTypes to process
    */

    if (!_.isUndefined(types)) {
      if (_.include(types, 'Files') || _.include(types, 'text/plain') || _.include(types, 'text/uri-list')) {
        this.onDrop(e.dataTransfer);
      }
    }

    SirTrevor.EventBus.trigger('block:content:dropped');
  }

};