/*
  Block Quote
*/

SirTrevor.Blocks.Quote = SirTrevor.Block.extend({ 
  
  type: 'Quote',
  
  editorHTML: function() {
    return _.template('<blockquote class="st-required st-text-block <%= className %>" contenteditable="true"></blockquote>\
        <input maxlength="140" name="cite" placeholder="Credit" class="st-input-string st-required" type="text" />', this);
  },
  
  loadData: function(data){
    this.$$('.st-text-block').html(SirTrevor.toHTML(data.text, this.type));
    this.$$('input').val(data.cite);
  },
  
  toMarkdown: function(markdown) {
    return markdown.replace(/^(.+)$/mg,"> $1");
  }
  
});