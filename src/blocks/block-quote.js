/*
  Block Quote
*/

SirTrevor.Blocks.Quote = (function(){

  var template = _.template([
    '<blockquote class="st-required st-text-block" contenteditable="true"></blockquote>',
    '<label class="st-input-label">Credit</label>',
    '<input maxlength="140" name="cite" placeholder="Credit" class="st-input-string st-required js-cite-input" type="text" />'
  ].join("\n"));

  return SirTrevor.Block.extend({

    type: 'Quote',

    icon_name: 'quote',

    editorHTML: function() {
      return template(this);
    },

    loadData: function(data){
      this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
      this.$('.js-cite-input').val(data.cite);
    },

    toMarkdown: function(markdown) {
      return markdown.replace(/^(.+)$/mg,"> $1");
    }

  });

})();