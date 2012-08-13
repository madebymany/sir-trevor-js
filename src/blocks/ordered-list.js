/*
  Ordered List
*/

var template = '<div class="text-block <%= className %>" contenteditable="true"></div>';

var OrderedList = SirTrevor.BlockType.extend({ 
  
  title: "List",
  className: "ordered-list",
  
  editorHTML: function() {
    return _.template(template, this);
  },
  
  onBlockRender: function(){
    
    this.$('.text-block').bind('click', function(){
      if($(this).html().length === 0){
        document.execCommand("insertOrderedList",false,false);
      }
    });
    
    // Put in a list
    if (_.isEmpty(this.data)) {
      this.$('.text-block').focus().click();
    }
  },
    
  loadData: function(data){
    this.$('.text-block').html("<ol>" + this.instance._toHTML(data.text, this.type) + "</ol>");
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

SirTrevor.BlockTypes.OrderedList = new OrderedList();