/*
  Block Quote
*/

var BlockQuote = SirTrevor.BlockType.extend({ 
  
  title: "Quote",
  className: "block-quote",
  limit: 0,
  
  editorHTML: function() {
    return _.template('<blockquote class="text-block <%= className %>" contenteditable="true"></blockquote><div class="input text"><label>Credit</label><input data-maxlength="140" name="cite" class="input-string" type="text" /></div>', this);
  },
  
  loadData: function(data){
    this.$('.text-block').html(this.instance._toHTML(data.text, this.type));
    this.$('input').val(data.cite);
  },
  
  toMarkdown: function(markdown) {
    return markdown.replace(/^(.+)$/mg,"> $1");
  }
  
});

SirTrevor.BlockTypes.BlockQuote = new BlockQuote();