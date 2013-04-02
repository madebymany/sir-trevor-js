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

  bound: ['handleWrapperMouseOver', 'handleWrapperMouseOut'],

  className: 'st-block-controls--floating',
  tagName: 'a',

  initialize: function() {
    this.$wrapper.bind('mouseover', this.handleWrapperMouseOver)
                 .bind('mouseout', this.handleWrapperMouseOut);
  },

  handleWrapperMouseOver: function() {
    console.log('Mouseover');
  },

  handleWrapperMouseOut: function() {
    console.log('Mouseout');
  }

});