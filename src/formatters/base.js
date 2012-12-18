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

/*
  Create our formatters and add a static reference to them
*/
SirTrevor.Formatters.Bold = new Bold();
SirTrevor.Formatters.Italic = new Italic();
SirTrevor.Formatters.Link = new Link();
SirTrevor.Formatters.Unlink = new UnLink();