/* Our base formatters */

SirTrevor.Formatters.Bold = new SirTrevor.Formatter({
  title: "B",
  className: "bold",
  cmd: "bold",
  keyCode: 66
});

SirTrevor.Formatters.Italic = new SirTrevor.Formatter({
  title: "I",
  className: "italic",
  cmd: "italic",
  keyCode: 73
});

SirTrevor.Formatters.Underline = new SirTrevor.Formatter({
  title: "U",
  className: "underline",
  cmd: "underline"
});

SirTrevor.Formatters.Link = new SirTrevor.Formatter({
  
  title: "Link",
  className: "link",
  cmd: "CreateLink",
  
  onClick: function() {
    
    var link = prompt("Enter a link"),
        link_regex = /(ftp|http|https):\/\/./;
    
    if(link && link.length > 0) {
      
     if (!link_regex.test(link)) { 
       link = "http://" + link; 
     }
     
     document.execCommand(this.cmd, false, link);
    }
  }
});

SirTrevor.Formatters.Unlink = new SirTrevor.Formatter({
  title: "Unlink",
  className: "link",
  cmd: "unlink"
});

SirTrevor.Formatters.Heading1 = new SirTrevor.Formatter({
  title: "H1",
  className: "heading h1",
  cmd: "formatBlock",
  param: "H1",
  
  toMarkdown: function(markdown) {
    return markdown.replace(/<h1>([^*|_]+)<\/h1>/mg,"#$1#\n"); 
  },
  
  toHTML: function(html) {
    return html.replace(/(?:#)([^*|_]+)(?:#)/mg,"<h1>$1</h1>"); 
  }
    
});

SirTrevor.Formatters.Heading2 = new SirTrevor.Formatter({
  title: "H2",
  className: "heading h2",
  cmd: "formatBlock",
  param: "H2",
  
  toMarkdown: function(markdown) {
    return markdown.replace(/<h2>([^*|_]+)<\/h2>/mg,"##$1##\n"); 
  },
  
  toHTML: function(html) {
    return html.replace(/(?:##)([^*|_]+)(?:##)/mg,"<h2>$1</h2>"); 
  }
});
