/*
  Text Block
*/
SirTrevor.Blocks.Text = SirTrevor.Block.extend({

  type: 'Text',

  editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',

  icon_name: 'text',

  loadData: function(data){
    this.getTextBlock().html(SirTrevor.toHTML(data.text, this.type));
  }
});