/*
  Unordered List
*/

var template = '<div class="text-block <%= className %>" contenteditable="true"></div>';

SirTrevor.Blocks.Ul = SirTrevor.Block.extend({ 
  
  title: "List",
  className: "list",
  
  editorHTML: function() {
    return _.template(template, this);
  },
  
  onBlockRender: function() {
    this.$$('.text-block').bind('click', function(){
      if($(this).html().length === 0){
        document.execCommand("insertUnorderedList",false,false);
      }
    });
    
    // Put in a list
    if (_.isEmpty(this.data)) {
      this.$$('.text-block').focus().click();
    }
    
  },
    
  loadData: function(data){
    this.$$('.text-block').html("<ul>" + this.instance._toHTML(data.text, this.type) + "</ul>");
  },
  
  toMarkdown: function(markdown) {
    return markdown.replace(/<\/li>/mg,"\n")
                   .replace(/<\/?[^>]+(>|$)/g, "")
                   .replace(/^(.+)$/mg," - $1"); 
  },
  
  toHTML: function(html) {
		html = html.replace(/^ - (.+)$/mg,"<li>$1</li>")
							 .replace(/\n/mg,"");
							
		html = "<ul>" + html + "</ul>"
		
		return html
  }

});
