/*
  Unordered List
*/

SirTrevor.Blocks.List = (function() {

  var template = '<ul class="st-text-block" contenteditable="true"><li></li></ul>';

  return SirTrevor.Block.extend({

    type: "List",

    editorHTML: function() {
      return _.template(template, this);
    },

    loadData: function(data){
      this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
    },

    toMarkdown: function(markdown) {
      return markdown.replace(/<\/li>/mg,"\n")
                     .replace(/<\/?[^>]+(>|$)/g, "")
                     .replace(/^(.+)$/mg," - $1");
    },

    toHTML: function(html) {
      return html.replace(/^ - (.+)$/mg,"<li>$1</li>").replace(/\n/mg,"");
    }

  });

})();
