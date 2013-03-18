/*
  Block Quote
*/

SirTrevor.Blocks.Quote = SirTrevor.Block.extend({ 
  
  type: 'Quote',
  title: "Quote",
  className: "quote",
  limit: 0,
  
  editorHTML: function() {
    return _.template('<blockquote class="st-required st-text-block <%= className %>" contenteditable="true"></blockquote><div class="input text"><label>Credit</label><input maxlength="140" name="cite" class="input-string required" type="text" /></div>', this);
  },
  
  loadData: function(data){
    this.$$('.st-text-block').html(SirTrevor.toHTML(data.text, this.type));
    this.$$('input').val(data.cite);
  },
  
  toMarkdown: function(markdown) {
    return markdown.replace(/^(.+)$/mg,"> $1");
  }
  
});