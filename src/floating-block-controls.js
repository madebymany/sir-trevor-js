/*
  SirTrevor Floating Block Controls
  --
  Draws the 'plus' between blocks
*/

var FloatingBlockControls = SirTrevor.FloatingBlockControls = function(wrapper) {
  this.$wrapper = wrapper;
  this._bindFunctions();
  this.initialize();
};

_.extend(FloatingBlockControls.prototype, FunctionBind, Events, {

  bound: ['handleWrapperMouseOver', 'handleBlockMouseOut', 'handleBlockClick'],

  initialize: function() {
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
  }

});