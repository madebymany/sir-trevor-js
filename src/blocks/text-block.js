/*
  Text Block
*/

var template = '<div class="<%= className %>" contenteditable="true"></div>';

SirTrevor.BlockTypes.TextBlock = new SirTrevor.BlockType({ 
  title: "Text",
  className: "text-block",
  toolbarEnabled: true,
  dropEnabled: false,
  limit: 0,
  
  editorHTML: function() {
    return _.template(template, this);
  },
  
  validate: function() {
    console.log(this.$el.html().length);
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