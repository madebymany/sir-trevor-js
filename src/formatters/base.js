/* Our base formatters */

var Bold = SirTrevor.Formatter.extend({
  title: "bold",
  cmd: "bold",
  keyCode: 66,
  text : "B"
});

var Italic = SirTrevor.Formatter.extend({
  title: "italic",
  cmd: "italic",
  keyCode: 73,
  text : "i"
});

var Underline = SirTrevor.Formatter.extend({
  title: "underline",
  cmd: "underline",
  text : "U"
});

var Link = SirTrevor.Formatter.extend({

  title: "link",
  iconName: "link",
  cmd: "CreateLink",
  text : "link",

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
  title: "unlink",
  iconName: "link",
  cmd: "unlink",
  text : "link",
});

/*
  Create our formatters and add a static reference to them
*/
SirTrevor.Formatters.Bold = new Bold();
SirTrevor.Formatters.Italic = new Italic();
SirTrevor.Formatters.Underline = new Underline();
SirTrevor.Formatters.Link = new Link();
SirTrevor.Formatters.Unlink = new UnLink();