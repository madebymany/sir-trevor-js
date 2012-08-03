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
