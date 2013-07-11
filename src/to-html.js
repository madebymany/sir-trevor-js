SirTrevor.toHTML = function(markdown, type) {
  var html = markdown;

  html = html.replace(/^\> (.+)$/mg,"$1")
             .replace(/\[([^\]]+)\]\(([^\)]+)\)/g,"<a href='$2'>$1</a>")
             .replace(/([\W_]|^)(\*\*|__)(?=\S)([^\r]*?\S[\*_]*)\2([\W_]|$)/g, "$1<strong>$3</strong>$4")
             .replace(/([\W_]|^)(\*|_)(?=\S)([^\r\*_]*?\S)\2([\W_]|$)/g, "$1<em>$3</em>$4")
             .replace(/  +\n/g, " <br>\n");

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

  return html;
};