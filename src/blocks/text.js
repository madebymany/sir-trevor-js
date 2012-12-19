/*
  Text Block
*/
SirTrevor.Blocks.Text = SirTrevor.Block.extend({ 
  
  title: "Text",
  className: "text",
  limit: 0,
  
  editorHTML: '<div class="required text-block" contenteditable="true"></div>',
  
  loadData: function(data){
    this.$$('.text-block').html(this.instance._toHTML(data.text, this.type));
  }
});