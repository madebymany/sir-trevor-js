/* Our base formatters */
(function(){

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

  var Link = SirTrevor.Formatter.extend({

    title: "link",
    iconName: "link",
    cmd: "CreateLink",
    text : "link",

    onClick: function() {

      var link = prompt(i18n.t("general:link")),
          link_regex = /((ftp|http|https):\/\/.)|mailto(?=\:[-\.\w]+@)/;

      if(link && link.length > 0) {

       if (!link_regex.test(link)) {
         link = "http://" + link;
       }

       document.execCommand(this.cmd, false, link);
      }
    },

    isActive: function() {
      var selection = window.getSelection(),
          node;

      if (selection.rangeCount > 0) {
        node = selection.getRangeAt(0)
                        .startContainer
                        .parentNode;
      }

      return (node && node.nodeName == "A");
    }
  });

  var UnLink = SirTrevor.Formatter.extend({
    title: "unlink",
    iconName: "link",
    cmd: "unlink",
    text : "link"
  });

  var Superscript = SirTrevor.Formatter.extend({
    title: "superscript",
    cmd: "superscript",
    text: "sup",
    keyCode: 85,
    toMarkdown: function( markdown ) {
      function replaceSuperscripts(match, p1, p2){
        if(_.isUndefined(p2)) { p2 = ''; }
        return "^^^^" + p1.replace(/<(.)?br(.)?>/g, '') + "^^^^" + p2;
      }

      return markdown
        .replace('<sup><br></sup>', '<br>')
        .replace(/<sup>(?:\s*)(.*?)(\s)*?<\/sup>/gim, replaceSuperscripts);
    },
    toHTML: function( html ) {
      return _.reverse(
        _.reverse(html)
        .replace(/\^\^\^\^(?!\\)((\^\^\^\^\\|[^\^\^\^\^])*)\^\^\^\^(?=$|[^\\])/gm, function(match, p1) {
          return ">pus/<"+ p1.replace(/\r?\n/g, '').replace(/[\s]+$/,'') +">pus<";
        }));
    }
  });

  var Subscript = SirTrevor.Formatter.extend({
    title: "subscript",
    cmd: "subscript",
    text: "sub",
    keyCode: 68,
    toMarkdown: function( markdown ) {
      function replaceSubscripts(match, p1, p2){
        if(_.isUndefined(p2)) { p2 = ''; }
        return "vvvv" + p1.replace(/<(.)?br(.)?>/g, '') + "vvvv" + p2;
      }

      return markdown
        .replace('<sub><br></sub>', '<br>')
        .replace(/<sub>(?:\s*)(.*?)(\s)*?<\/sub>/gim, replaceSubscripts);
    },
    toHTML: function( html ) {
      return _.reverse(
        _.reverse(html)
        .replace(/vvvv(?!\\)((vvvv\\|[^vvvv])*)vvvv(?=$|[^\\])/gm, function(match, p1) {
          return ">bus/<"+ p1.replace(/\r?\n/g, '').replace(/[\s]+$/,'') +">bus<";
        }));
    }
  });

  /*
    Create our formatters and add a static reference to them
  */
  SirTrevor.Formatters.Bold = new Bold();
  SirTrevor.Formatters.Italic = new Italic();
  SirTrevor.Formatters.Link = new Link();
  SirTrevor.Formatters.Unlink = new UnLink();
  SirTrevor.Formatters.Superscript = new Superscript();
  SirTrevor.Formatters.Subscript = new Subscript();

})();
