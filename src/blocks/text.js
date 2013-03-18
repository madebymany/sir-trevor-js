/*
  Text Block
*/
SirTrevor.Blocks.Text = SirTrevor.Block.extend({ 
  
  type: 'Text',

  editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',
  
  loadData: function(data){
    this.$$('.st-text-block').html(SirTrevor.toHTML(data.text, this.type));
  }
});