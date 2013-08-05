/*
  Unordered List
*/

SirTrevor.Blocks.List = (function() {

  var template = '<div class="st-text-block" contenteditable="true"><ul><li></li></ul></div>';

  return SirTrevor.Block.extend({

    type: "List",

    icon_name: 'list',

    editorHTML: function() {
      return _.template(template, this);
    },

    loadData: function(data){
      this.getTextBlock().html("<ul>" + SirTrevor.toHTML(data.text, this.type) + "</ul>");
    },

    onBlockRender: function() {
      this.getTextBlock().bind('click', function(){
        if($(this).text().length < 1) {
          document.execCommand("insertUnorderedList",false,false);
        }
      });
    },

    toMarkdown: function(markdown) {
      return markdown.replace(/<\/li>/mg,"\n")
                     .replace(/<\/?[^>]+(>|$)/g, "")
                     .replace(/^(.+)$/mg," - $1");
    },

    toHTML: function(html) {
      html = html.replace(/^ - (.+)$/mg,"<li>$1</li>")
                 .replace(/\n/mg,"");

      html = "<ul>" + html + "</ul>";

      return html;
    }

  });

})();
