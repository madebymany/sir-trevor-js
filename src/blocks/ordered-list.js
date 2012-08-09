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
    
    block.$('.text-block').bind('click', function(){
      if($(this).html().length === 0){
        document.execCommand("insertOrderedList",false,false);
      }
    });
    
    // Put in a list
    if (_.isEmpty(block.data)) {
      block.$('.text-block').focus().click();
    }
    
  },
    
  loadData: function(block, data){
    block.$('.text-block').html("<ol>" + block.instance._toHTML(data.text, block.type) + "</ol>");
  },
  
  toMarkdown: function(markdown){
    return markdown.replace(/<\/li>/mg,"\n")
                   .replace(/<\/?[^>]+(>|$)/g, "")
                   .replace(/^(.+)$/mg," 1. $1");
  },
  
  toHTML: function(html) {
    return html.replace(/^ 1. (.+)$/mg,"<li>$1</li>");
  }
});