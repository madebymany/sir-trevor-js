SirTrevor.toHTML = function(markdown, type) {
  var html = markdown;

  // Use custom formatters toHTML functions (if any exist)
  var formatName, format;
  for(formatName in this.formatters) {
    if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
      format = SirTrevor.Formatters[formatName];
      // Do we have a toHTML function?
      if (!_.isUndefined(format.toHTML) && _.isFunction(format.toHTML)) {
        html = format.toHTML(html);
      }
    }
  }

  // Use custom block toHTML functions (if any exist)
  var block;
  if (SirTrevor.Blocks.hasOwnProperty(type)) {

    block = SirTrevor.Blocks[type];
    // Do we have a toHTML function?
    if (!_.isUndefined(block.prototype.toHTML) && _.isFunction(block.prototype.toHTML)) {
      html = block.prototype.toHTML(html);
    }
  }

  html =  html.replace(/^\> (.+)$/mg,"$1")                                       // Blockquotes
              .replace(/\n\n/g,"<br>")                                           // Give me some <br>s
              .replace(/\[([^\]]+)\]\(([^\)]+)\)/g,"<a href='$2'>$1</a>")        // Links
              .replace(/(?:_)([^*|_(http)]+)(?:_)/g,"<i>$1</i>")                 // Italic, avoid italicizing two links with underscores next to each other
              .replace(/(?:\*\*)([^*|_]+)(?:\*\*)/g,"<b>$1</b>");                // Bold

  return html;
};