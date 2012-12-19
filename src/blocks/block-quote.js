/*
  Block Quote
*/

SirTrevor.Blocks.Quote = SirTrevor.Block.extend({ 
  
  title: "Quote",
  className: "quote",
  limit: 0,
  
  editorHTML: function() {
    return _.template('<blockquote class="required text-block <%= className %>" contenteditable="true"></blockquote><div class="input text"><label>Credit</label><input maxlength="140" name="cite" class="input-string required" type="text" /></div>', this);
  },
  
  loadData: function(data){
    this.$$('.text-block').html(this.instance._toHTML(data.text, this.type));
    this.$$('input').val(data.cite);
  },
  
  toMarkdown: function(markdown) {
    return markdown.replace(/^(.+)$/mg,"> $1");
  }
  
});