/* Our base formatters */

var Bold = SirTrevor.Formatter.extend({
  title: "B",
  className: "bold",
  cmd: "bold",
  keyCode: 66
});

var Italic = SirTrevor.Formatter.extend({
  title: "I",
  className: "italic",
  cmd: "italic",
  keyCode: 73
});

var Underline = SirTrevor.Formatter.extend({
  title: "U",
  className: "underline",
  cmd: "underline"
});

var Link = SirTrevor.Formatter.extend({
  
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

var UnLink = SirTrevor.Formatter.extend({
  title: "Unlink",
  className: "link",
  cmd: "unlink"
});

var Heading1 = SirTrevor.Formatter.extend({
  
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

var Heading2 = SirTrevor.Formatter.extend({
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

/*
  Create our formatters and add a static reference to them
*/
SirTrevor.Formatters.Bold = new Bold();
SirTrevor.Formatters.Italic = new Italic();
SirTrevor.Formatters.Link = new Link();
SirTrevor.Formatters.Unlink = new UnLink();
//SirTrevor.Formatters.Heading1 = new Heading1();
//SirTrevor.Formatters.Heading2 = new Heading2();