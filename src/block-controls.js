/*
  SirTrevor Block Controls
  --
  Gives an interface for adding new Sir Trevor blocks.
*/

var BlockControls = SirTrevor.BlockControls = function(available_types, instance_scope) {
  this.instance_scope = instance_scope;
  this.available_types = available_types || [];
  this._ensureElement();
  this._bindFunctions();
  this.initialize();
};

_.extend(BlockControls.prototype, FunctionBind, Renderable, Events, {

  bound: ['handleControlButtonClick'],
  block_controls: null,

  className: "st-block-controls",

  initialize: function() {
    for(var block_type in this.available_types) {
      if (SirTrevor.Blocks.hasOwnProperty(block_type)) {
        var block_control = new SirTrevor.BlockControl(block_type, this.instance_scope);
        if (block_control.can_be_rendered) {
          this.$el.append(block_control.render().$el);
        }
      }
    }

    this.$el.delegate('.st-block-control', 'click', this.handleControlButtonClick);
  },

  show: function() {
    this.$el.addClass('st-block-controls--active');
  },

  hide: function() {
    this.$el.removeClass('st-block-controls--active');
  },

  handleControlButtonClick: function(e) {
    this.trigger('createBlock', e.currentTarget.dataset.type);
    this.hide();
  }

});



