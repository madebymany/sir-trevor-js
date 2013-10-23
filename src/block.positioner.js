SirTrevor.BlockPositioner = (function(){

  var template = [
    "<div class='st-block-positioner__inner'>",
    "<span class='st-block-positioner__selected-value'></span>",
    "<select class='st-block-positioner__select'></select>",
    "</div>"
  ].join("\n");

  var BlockPositioner = function(block_element, instance_id) {
    this.$block = block_element;
    this.instanceID = instance_id;
    this.total_blocks = 0;

    this._ensureElement();
    this._bindFunctions();

    this.initialize();
  };

  _.extend(BlockPositioner.prototype, FunctionBind, Renderable, {

    bound: ['onBlockCountChange', 'onSelectChange', 'toggle', 'show', 'hide'],

    className: 'st-block-positioner',
    visibleClass: 'st-block-positioner--is-visible',

    initialize: function(){
      this.$el.append(template);
      this.$select = this.$('.st-block-positioner__select');

      this.$select.on('change', this.onSelectChange);

      SirTrevor.EventBus.on(this.instanceID + ":blocks:count_update", this.onBlockCountChange);
    },

    onBlockCountChange: function(new_count) {
      if (new_count != this.total_blocks) {
        this.total_blocks = new_count;
        this.renderPositionList();
      }
    },

    onSelectChange: function() {
      var val = this.$select.val();
      if (val !== 0) {
        SirTrevor.EventBus.trigger(this.instanceID + ":blocks:change_position",
                                   this.$block, val, (val == 1 ? 'before' : 'after'));
        this.toggle();
      }
    },

    renderPositionList: function() {
      var inner = "<option value='0'>" + i18n.t("general:position") + "</option>";
      for(var i = 1; i <= this.total_blocks; i++) {
        inner += "<option value="+i+">"+i+"</option>";
      }
      this.$select.html(inner);
    },

    toggle: function() {
      this.$select.val(0);
      this.$el.toggleClass(this.visibleClass);
    },

    show: function(){
      this.$el.addClass(this.visibleClass);
    },

    hide: function(){
      this.$el.removeClass(this.visibleClass);
    }

  });

  return BlockPositioner;

})();