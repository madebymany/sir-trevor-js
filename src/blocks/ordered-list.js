/*
  Ordered List
*/

SirTrevor.BlockTypes.OrderedList = new SirTrevor.BlockType({ 
  title: "Ordered List",
  className: "ordered-list",
  toolbarEnabled: true,
  dropEnabled: false,
  limit: 0,
  editorHTML: "",
  
  onBlockRender: function(block){
    // Put in a list
    block.$('.text-block').focus();
    document.execCommand("insertOrderedList",false,false);
  }
});