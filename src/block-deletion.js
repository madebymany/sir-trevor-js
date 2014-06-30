SirTrevor.BlockDeletion = (function(){

  var BlockDeletion = function() {
    this._ensureElement();
    this._bindFunctions();
  };

  _.extend(BlockDeletion.prototype, FunctionBind, Renderable, {

    tagName: 'a',
    className: 'st-block-ui-btn st-block-ui-btn--delete st-icon',

    attributes: {
      html: 'delete',
      'data-icon': 'bin'
    }

  });

  return BlockDeletion;

})();