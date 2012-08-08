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

    block.$('.text-block').bind('click', function(){
      if($(this).html().length === 0){
        document.execCommand("insertUnorderedList",false,false);
      }
    });
    
    // Put in a list
    if (_.isEmpty(block.data)) {
      block.$('.text-block').focus().click();
    }
    
  },
    
  loadData: function(block, data){
    block.$('.text-block').html("<ul>" + toHTML(data.text) + "</ul>");
  }
});