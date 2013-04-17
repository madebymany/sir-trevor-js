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

  bound: ['handleUIButtonClick', 'handleControlButtonClick'],

  className: "st-block-controls",

  initialize: function() {
    var block_controls_btn = $("<a>", { 'class': 'st-block-controls__activate-btn' });
    this.$el.append(block_controls_btn);

    var block_control_inner = $("<div>", { 'class': 'st-block-controls__inner' });
    this.$el.append(block_control_inner);
    this.$inner = block_control_inner;

    for(var block_type in this.available_types) {
      if (SirTrevor.Blocks.hasOwnProperty(block_type)) {
        var block_control = new SirTrevor.BlockControl(block_type, this.instance_scope);
        if (block_control.can_be_rendered) {
          this.$inner.append(block_control.render().$el);
        }
      }
    }

    block_controls_btn.bind('click', this.handleUIButtonClick);

    this.$inner.delegate('.st-block-control', 'click', this.handleControlButtonClick);
  },

  toggleState: function() {
    this.$inner.addClass('st-block-controls__inner--active');
  },

  handleUIButtonClick: function() {
    this.trigger('showBlockControls', this.$el);
  },

  handleControlButtonClick: function(e) {
    console.log("CLICKED");
    this.trigger('createBlock', e.currentTarget.dataset.type);
    this.toggleState();
  }

});



