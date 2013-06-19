/*
  Unordered List
*/

var template = '<ul class="st-text-block" contenteditable="true"><li></li></ul>';

SirTrevor.Blocks.List = SirTrevor.Block.extend({

  type: "List",

  editorHTML: function() {
    return _.template(template, this);
  },

  loadData: function(data){
    this.$$('.st-text-block').html("<ul>" + SirTrevor.toHTML(data.text, this.type) + "</ul>");
  },

  toMarkdown: function(markdown) {
    return markdown.replace(/<\/li>/mg,"\n")
                   .replace(/<\/?[^>]+(>|$)/g, "")
                   .replace(/^(.+)$/mg," - $1");
  },

  toHTML: function(html) {
		html = html.replace(/^ - (.+)$/mg,"<li>$1</li>").replace(/\n/mg,"");
		return "<ul>" + html + "</ul>";
  }

});
