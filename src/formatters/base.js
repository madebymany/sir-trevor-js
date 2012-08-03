/* Our base formatters */

SirTrevor.Formatters.Bold = new SirTrevor.Format({
  title: "B",
  className: "bold",
  cmd: "bold",
  keyCode: 66
});

SirTrevor.Formatters.Italic = new SirTrevor.Format({
  title: "I",
  className: "italic",
  cmd: "italic",
  keyCode: 73
});

SirTrevor.Formatters.Link = new SirTrevor.Format({
  title: "Link",
  className: "link",
  cmd: "CreateLink"
});

SirTrevor.Formatters.Unlink = new SirTrevor.Format({
  title: "Unlink",
  className: "link",
  cmd: "unlink"
});
