/* Adds drop functionaltiy to this block */

SirTrevor.BlockMixins.Droppable = {

  mixinName: "Droppable",
  valid_drop_file_types: ['File', 'Files', 'text/plain', 'text/uri-list'],

  initializeDroppable: function() {
    SirTrevor.log("Adding droppable to block " + this.blockID);

    this.drop_options = Object.assign({}, SirTrevor.DEFAULTS.Block.drop_options, this.drop_options);

    var drop_html = $(_.template(this.drop_options.html)({ block: this }));

    this.$editor.hide();
    this.$inputs.append(drop_html);
    this.$dropzone = drop_html;

    // Bind our drop event
    this.$dropzone.dropArea()
                  .bind('drop', this._handleDrop.bind(this));

    this.$inner.addClass('st-block__inner--droppable');
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

    if (types &&
        types.some(function(type) {
                     return this.valid_drop_file_types.includes(type);
                   }, this)) {
      this.onDrop(e.dataTransfer);
    }

    SirTrevor.EventBus.trigger('block:content:dropped', this.blockID);
  }

};
