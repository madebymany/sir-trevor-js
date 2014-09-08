SirTrevor.BlockControl = (function(){

  var BlockControl = function(type, instance_scope) {
    this.type = type;
    this.instance_scope = instance_scope;
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
      var html = '<span class="st-icon">'+ _.result(this.block_type, 'icon_name') +'</span>';
      if (SirTrevor.DEFAULTS.showBlockControlTitleText) {
        html = html + _.result(this.block_type, 'title');
      }
      this.$el.html(html);
      return this;
    }
  });

  return BlockControl;

})();