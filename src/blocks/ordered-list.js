/*
  Ordered List
*/

var template = '<div class="text-block <%= className %>" contenteditable="true"></div>';

SirTrevor.BlockTypes.OrderedList = new SirTrevor.BlockType({ 
  title: "Ordered List",
  className: "ordered-list",
  toolbarEnabled: true,
  dropEnabled: false,
  limit: 0,
  
  editorHTML: function() {
    return _.template(template, this);
  },
  
  onBlockRender: function(block){
    // Put in a list
    block.$('.text-block').focus();
    document.execCommand("insertOrderedList",false,false);
  }
});