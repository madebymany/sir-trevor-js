/*
  Unordered List
*/

SirTrevor.Blocks.List = (function() {

  var template = '<div class="st-text-block" contenteditable="true"><ul><li></li></ul></div>';

  return SirTrevor.Block.extend({

    type: i18n.t("blocks:unorderedlist_type"),

    icon_name: 'list',

    editorHTML: function() {
      return _.template(template, this);
    },

    loadData: function(data){
      this.getTextBlock().html("<ul>" + SirTrevor.toHTML(data.text, this.type) + "</ul>");
    },

    onBlockRender: function() {
      this.checkForList = _.bind(this.checkForList, this);
      this.getTextBlock().on('click keyup', this.checkForList);
    },

    checkForList: function() {
      if (this.$('ul').length === 0) {
        document.execCommand("insertUnorderedList", false, false);
      }
    },

    toMarkdown: function(markdown) {
      return markdown.replace(/<\/li>/mg,"\n")
                     .replace(/<\/?[^>]+(>|$)/g, "")
                     .replace(/^(.+)$/mg," - $1");
    },

    toHTML: function(html) {
      html = html.replace(/^ - (.+)$/mg,"<li>$1</li>")
                 .replace(/\n/mg, "");

      return html;
    },

    onContentPasted: function(event, target) {
      var replace = this.pastedMarkdownToHTML(target[0].innerHTML),
          list = this.$('ul').html(replace);

      this.getTextBlock().caretToEnd();
    }

  });

})();
