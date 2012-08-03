/*
  Block Quote
*/

SirTrevor.Blocks.BlockQuote = new SirTrevor.Block({ 
  title: "Quote",
  toolbarEnabled: true,
  dropEnabled: false,
  limit: 0,
  editorHTML: "",
  loadData: function(block, data){
    block.find('input').val(data.cite);
  }
});