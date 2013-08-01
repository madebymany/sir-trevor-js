SirTrevor.toHTML = function(markdown, type) {
  // MD -> HTML
  var html = markdown;

  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g,"<a href='$2'>$1</a>")
             .replace(/(?:\*\*)([^*|_]+)(?:\*\*)/g,"<strong>$1</strong>")       // Bold
             .replace(/(^|[^\\])_((\\.|[^_])+)_/g, "$1<em>$2</em>")
             .replace(/^\> (.+)$/mg,"$1")
             .replace(/\n\n/g, "<br>");

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

  // Replace escaped
  html = html.replace(/\\\*/g, "*")
             .replace(/\\\[/g, "[")
             .replace(/\\\]/g, "]")
             .replace(/\\\_/g, "_")
             .replace(/\\\(/g, "(")
             .replace(/\\\)/g, ")")
             .replace(/\-/g, "-");

  return html;
};