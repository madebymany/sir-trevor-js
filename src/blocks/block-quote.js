/*
  Block Quote
*/

SirTrevor.BlockTypes.BlockQuote = new SirTrevor.BlockType({ 
  
  title: "Quote",
  className: "block-quote",
  toolbarEnabled: true,
  dropEnabled: false,
  limit: 0,
  
  editorHTML: function() {
    return _.template('<blockquote class="text-block <%= className %>" contenteditable="true"></blockquote><div class="input text"><label>Credit</label><input data-maxlength="140" name="cite" class="input-string" type="text" /></div>', this);
  },
  
  loadData: function(data){
    block.$('.text-block').html(block.instance._toHTML(data.text, this.type));
    block.$('input').val(data.cite);
  },
  
  toMarkdown: function(markdown) {
    return markdown.replace(/^(.+)$/mg,"> $1");
  }
  
});