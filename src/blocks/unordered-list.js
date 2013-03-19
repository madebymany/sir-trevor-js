/*
  Unordered List
*/

var template = '<div class="st-text-block" contenteditable="true"></div>';

SirTrevor.Blocks.Ul = SirTrevor.Block.extend({ 
  
  type: "List",
  
  editorHTML: function() {
    return _.template(template, this);
  },
  
  onBlockRender: function() {
    this.$$('.st-text-block').bind('click', function(){
      if($(this).html().length === 0){
        document.execCommand("insertUnorderedList",false,false);
      }
    });
    
    // Put in a list
    if (_.isEmpty(this.data)) {
      this.$$('.st-text-block').focus().click();
    }
  },
    
  loadData: function(data){
    this.$$('.st-text-block').html("<ul>" + SirTrevor.toHTML(data.text, this.type) + "</ul>");
  },
  
  toMarkdown: function(markdown) {
    return markdown.replace(/<\/li>/mg,"\n")
                   .replace(/<\/?[^>]+(>|$)/g, "")
                   .replace(/^(.+)$/mg," - $1"); 
  },
  
  toHTML: function(html) {
		html = html.replace(/^ - (.+)$/mg,"<li>$1</li>").replace(/\n/mg,"");
		return "<ul>" + html + "</ul>";
  }

});
