/*
  SirTrevor Floating Block Controls
  --
  Draws the 'plus' between blocks
*/

var FloatingBlockControls = SirTrevor.FloatingBlockControls = function(wrapper) {
  this.$wrapper = wrapper;
  this._ensureElement();
  this._bindFunctions();
  this.initialize();
};

_.extend(FloatingBlockControls.prototype, FunctionBind, Renderable, Events, {

  bound: ['handleWrapperMouseOver', 'handleBlockMouseOut', 'handleBlockClick'],

  className: 'st-fl-block-controls',

  initialize: function() {
    this.$btn = $("<a>", { 'class': "st-fl-block-controls__plus" });
    this.$el.html(this.$btn)
            .addClass('st-fl-block-controls--hidden');

    this.$wrapper.on('mouseover', '.st-block', this.handleBlockMouseOver);
    this.$wrapper.on('click', '.st-block--with-plus', this.handleBlockClick);
    this.$wrapper.on('mouseout', '.st-block', this.handleBlockMouseOut);
  },

  handleBlockMouseOver: function(e) {
    var block = $(e.currentTarget);

    if (!block.hasClass('st-block--with-plus')) {
      block.addClass('st-block--with-plus');
    }
  },

  handleBlockMouseOut: function(e) {
    var block = $(e.currentTarget);

    if (block.hasClass('st-block--with-plus')) {
      block.removeClass('st-block--with-plus');
    }
  },

  handleBlockClick: function(e) {
    var block = $(e.currentTarget);

    this.trigger('showBlockControls', block);
  },

  showAt: function(top) {
    this.$el.css({ top: top + 'px' }).removeClass('st-fl-block-controls--hidden');
  }

});