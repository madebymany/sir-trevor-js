/*
  Unordered List
*/

var template = '<div class="text-block <%= className %>" contenteditable="true"></div>';

SirTrevor.BlockTypes.UnorderedList = new SirTrevor.BlockType({ 
  title: "Unordered List",
  className: "unordered-list",
  toolbarEnabled: true,
  dropEnabled: false,
  limit: 0,
  
  editorHTML: function() {
    return _.template(template, this);
  },
  
  onBlockRender: function(block){
    // Put in a list
    block.$('.text-block').focus();
    document.execCommand("insertUnorderedList",false,false);
  }
  
});