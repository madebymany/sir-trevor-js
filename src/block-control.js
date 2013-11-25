SirTrevor.BlockControl = (function(){

  var BlockControl = function(type) {
    this.type = type;
    this.block_type = SirTrevor.Blocks[this.type].prototype;
    this.can_be_rendered = this.block_type.toolbarEnabled;

    this._ensureElement();
  };

  _.extend(BlockControl.prototype, FunctionBind, Renderable, SirTrevor.Events, {

    tagName: 'a',
    className: "st-block-control",

    attributes: function() {
      return {
        'data-type': this.block_type.type
      };
    },

    render: function() {
      this.$el.html('<span class="st-icon">'+ _.result(this.block_type, 'icon_name') +'</span>' + _.result(this.block_type, 'title'));
      return this;
    }
  });

  return BlockControl;

})();