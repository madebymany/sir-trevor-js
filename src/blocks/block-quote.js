/*
  Block Quote
*/

var template = '<div class="<%= className %>" contenteditable="true"></div>';

SirTrevor.Blocks.BlockQuote = new SirTrevor.Block({ 
  title: "Quote",
  className: "block-quote",
  toolbarEnabled: true,
  dropEnabled: false,
  limit: 0,
  editorHTML: function() {
    return _.template(template, this);
  },
  loadData: function(data){
    $.find('input').val(data.cite);
  }
});