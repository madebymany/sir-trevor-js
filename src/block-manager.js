SirTrevor.BlockManager = (function(){

  var BlockManager = function(editorInstance, mediator) {
    this.instance_scope = editorInstance;
    this.mediator = mediator;

    this.initialize();
  };

  _.extend(BlockManager.prototype, FunctionBind, SirTrevor.Events, {

    blocks: [],

    events: {
      'createBlock': 'createBlock'
    },

    initialize: function() {
      this._subscribeToEvents();
    },

    createBlock: function(type, data) {
      type = _.classify(type);

      // Run validations

      var block = new SirTrevor.Blocks[type](data, this.instance_scope);
      this.blocks.push(block);

      // Render the block
      this.mediator.trigger('renderBlock', block);
    },

    removeBlock: function() {

    },

    _subscribeToEvents: function() {
      _.each(this.events, function(eventKey, callbackFunction) {
        this.listenTo(this.mediator, eventKey, this[callbackFunction]);
      }, this);
    }

  });

  return BlockManager;

})();