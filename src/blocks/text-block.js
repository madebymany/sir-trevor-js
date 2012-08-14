/*
  Text Block
*/

var tb_template = '<div class="required <%= className %>" contenteditable="true"></div>';

var TextBlock = SirTrevor.BlockType.extend({ 
  
  title: "Text",
  className: "text-block",
  
  editorHTML: function() {
    return _.template(tb_template, this);
  },
  
  loadData: function(data){
    this.$('.text-block').html(this.instance._toHTML(data.text, this.type));
  }
});

SirTrevor.BlockTypes.TextBlock = new TextBlock();