/*
  Unordered List
*/

SirTrevor.BlockTypes.UnorderedList = new SirTrevor.BlockType({ 
  title: "Unordered List",
  className: "unordered-list",
  toolbarEnabled: true,
  dropEnabled: false,
  limit: 0,
  editorHTML: "",
  
  onBlockRender: function(block){
    // Put in a list
    block.$('.text-block').focus();
    document.execCommand("insertUnorderedList",false,false);
  }
  
});