/*
  SirTrevor Block Controls
  --
  Gives an interface for adding new Sir Trevor blocks.
*/

SirTrevor.BlockControls = (function(){

  var BlockControls = function(available_types, instance_scope) {
    this.instance_scope = instance_scope;
    this.available_types = available_types || [];
    this._ensureElement();
    this._bindFunctions();
    this.initialize();
  };

  _.extend(BlockControls.prototype, FunctionBind, Renderable, SirTrevor.Events, {

    bound: ['handleControlButtonClick'],
    block_controls: null,

    className: "st-block-controls",

    html: "<a class='st-icon st-icon--close'>" + i18n.t("general:close") + "</a>",

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

      SirTrevor.EventBus.trigger('block:controls:shown');
    },

    hide: function() {
      this.$el.removeClass('st-block-controls--active');

      SirTrevor.EventBus.trigger('block:controls:hidden');
    },

    handleControlButtonClick: function(e) {
      e.stopPropagation();

      this.trigger('createBlock', $(e.currentTarget).attr('data-type'), null, this.current_container);
    }

  });

  return BlockControls;

})();


