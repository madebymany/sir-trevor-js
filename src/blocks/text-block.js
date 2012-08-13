/*
  Text Block
*/

var template = '<div class="<%= className %>" contenteditable="true"></div>';

var TextBlock = SirTrevor.BlockType.extend({ 
  
  title: "Text",
  className: "text-block",
  
  editorHTML: function() {
    return _.template(template, this);
  },
  
  validate: function() {
    if( this.$el.html().length === 0) {
      this.errors.push('You must enter some content');
      return false;
    }
    return true;
  },
  
  loadData: function(data){
    this.$('.text-block').html(this.instance._toHTML(data.text, this.type));
  },
  
  onBlockRender: function(){
  },
  
  onContentPasted: function(event){
    console.log('Content pasted');
  },
  
  onDrop: function(){
    console.log('Drop');
  }
  
});

SirTrevor.BlockTypes.TextBlock = new TextBlock();