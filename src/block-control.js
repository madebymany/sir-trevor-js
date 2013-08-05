SirTrevor.BlockControl = (function(){

  var BlockControl = function(type, instance_scope) {
    this.type = type;
    this.instance_scope = instance_scope;
    this._ensureElement();
    this.initialize();
  };

  _.extend(BlockControl.prototype, FunctionBind, Renderable, SirTrevor.Events, {

    tagName: 'a',
    className: "st-block-control",

    attributes: function() {
      return {
        'data-type': this.type
      };
    },

    initialize: function() {
      this.block_type = SirTrevor.Blocks[this.type].prototype;
      this.can_be_rendered = this.block_type.toolbarEnabled;
    },

    render: function() {
      this.$el.html('<span class="st-icon">'+ _.result(this.block_type, 'icon_name') +'</span>' + _.result(this.block_type, 'title'));
      return this;
    }
  });

  return BlockControl;

})();