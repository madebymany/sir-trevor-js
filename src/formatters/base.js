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
  cmd: "CreateLink"
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
    return markdown;
    //return markdown.replace(/<\/h1>/mg,"\n")
                   //.replace(/^(.+)$/mg,"#$1");
  },
  
  toHTML: function(html) {
    return html;
    //return html.replace(/^#(.+)$/mg,"<h1>$1</h1>");
  }
    
});

SirTrevor.Formatters.Heading2 = new SirTrevor.Formatter({
  title: "H2",
  className: "heading h2",
  cmd: "formatBlock",
  param: "H2",
  
  toMarkdown: function(markdown) {
    return markdown;
    //return markdown.replace(/<\/h2>/mg,"\n")
                   //.replace(/^(.+)$/mg,"##$1");
  },
  
  toHTML: function(html) {
    return html;
   // return html.replace(/^##(.+)$/mg,"<h2>$1</h2>");
  }
});
