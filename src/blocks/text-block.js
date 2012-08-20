/*
  Text Block
*/

var tb_template = '<div class="required text-block" contenteditable="true"></div>';

SirTrevor.Blocks.Text = SirTrevor.Block.extend({ 
  
  title: "Text",
  className: "text",
  
  editorHTML: function() {
    return _.template(tb_template, this);
  },
  
  loadData: function(data){
    this.$('.text-block').html(this.instance._toHTML(data.text, this.type));
  }
});