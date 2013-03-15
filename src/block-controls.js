/*
  SirTrevor Block Controls
  --
  Gives an interface for adding new Sir Trevor blocks.
*/

var BlockControls = SirTrevor.BlockControls = function(available_types, instance_scope) {
  this.instance_scope = instance_scope;
  this.available_types = available_types || [];
  this._ensureElement();
  this.initialize();
};

_.extend(BlockControls.prototype, FunctionBind, Renderable, Events, {

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

    this.$el.delegate('a', 'click', _.bind(this.handleButtonClick, this));
  },

  handleButtonClick: function(e) {
    e.preventDefault();
    this.trigger('createBlock', e.target.dataset.type);
  }

});



