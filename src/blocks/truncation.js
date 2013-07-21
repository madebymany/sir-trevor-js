SirTrevor.Blocks.Truncation = (function(){

  return SirTrevor.SimpleBlock.extend({

    type: "Truncation",

    className: 'st-block st-truncation-block',

    editorHTML : '<span class="st-truncation-block__text">Truncate here</span>',

    toData : function() {
      this.setData({ truncate : true });
    },

    validate : function() {
      return true;
    }

  });

})();
