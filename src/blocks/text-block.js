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
  validate: function(block) {
    console.log(block.$el.html().length);
    if( block.$el.html().length === 0) {
      block.errors.push('You must enter some content');
      return false;
    }
    return true;
  }
});