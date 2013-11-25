/*
  SirTrevor Block Controls
  --
  Gives an interface for adding new Sir Trevor blocks.
*/

SirTrevor.BlockControls = (function(){

  var BlockControls = function(available_types, mediator) {
    this.available_types = available_types || [];
    this.mediator = mediator;

    this._ensureElement();
    this._bindFunctions();
    this._bindMediatedEvents();

    this.initialize();
  };

  _.extend(BlockControls.prototype, FunctionBind, MediatedEvents, Renderable, SirTrevor.Events, {

    bound: ['handleControlButtonClick'],
    block_controls: null,

    className: "st-block-controls",
    eventNamespace: 'block-controls',

    mediatedEvents: {
      'render': 'renderInContainer',
      'show': 'show',
      'hide': 'hide'
    },

    initialize: function() {
      for(var block_type in this.available_types) {
        if (SirTrevor.Blocks.hasOwnProperty(block_type)) {
          var block_control = new SirTrevor.BlockControl(block_type);
          if (block_control.can_be_rendered) {
            this.$el.append(block_control.render().$el);
          }
        }
      }

      this.$el.delegate('.st-block-control', 'click', this.handleControlButtonClick);
      this.mediator.on('block-controls:show', this.renderInContainer);
    },

    show: function() {
      this.$el.addClass('st-block-controls--active');
    },

    hide: function() {
      this.removeCurrentContainer();
      this.$el.removeClass('st-block-controls--active');
    },

    handleControlButtonClick: function(e) {
      e.stopPropagation();

      this.mediator.trigger('block:create', $(e.currentTarget).attr('data-type'));
    },

    renderInContainer: function(container) {
      this.removeCurrentContainer();

      container.append(this.$el.detach());
      container.addClass('with-st-controls');

      this.currentContainer = container;
      this.show();
    },

    removeCurrentContainer: function() {
      if (!_.isUndefined(this.currentContainer)) {
        this.currentContainer.removeClass("with-st-controls");
        this.currentContainer = undefined;
      }
    }

  });

  return BlockControls;

})();


