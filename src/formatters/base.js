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

SirTrevor.Formatters.Heading1 = new SirTrevor.Formatter({
  title: "H1",
  className: "heading h1",
  cmd: "heading",
  param: "H1"
});

SirTrevor.Formatters.Heading2 = new SirTrevor.Formatter({
  title: "H2",
  className: "heading h2",
  cmd: "heading",
  param: "H2"
});
