SirTrevor.toHTML = function(markdown, type, onRender) {
  // MD -> HTML
  var html = markdown;

  if(_.isUndefined(onRender)) { onRender = true; }

  if (onRender) {
    html = "<div>" + html;
    html = html.replace(/\n\n/gm, "</div><div><br></div><div>");
    html = html.replace(/\n/gm, "</div><div>");
  }

  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gm,"<a href='$2'>$1</a>");

  // This may seem crazy, but because JS doesn't have a look behind,
  // we reverse the string to regex out the italic items (and bold)
  // and look for something that doesn't start (or end in the reversed strings case)
  // with a slash.
  html = _.reverse(
           _.reverse(html)
           .replace(/_((\\.|[^_])*)_(?=$|[^\\])/gm, ">i/<$1>i<")
           .replace(/\*\*((\\.|[^\*\*])*)\*\*(?=$|[^\\])/gm,">b/<$1>b<")
         );

  html =  html.replace(/^\> (.+)$/mg,"$1");

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

  html = html.replace(/\n/g, "<br>")
             .replace(/\*\*/, "")
             .replace(/__/, "");  // Cleanup any markdown characters left

  // Replace escaped
  html = html.replace(/\\\*/g, "*")
             .replace(/\\\[/g, "[")
             .replace(/\\\]/g, "]")
             .replace(/\\\_/g, "_")
             .replace(/\\\(/g, "(")
             .replace(/\\\)/g, ")")
             .replace(/\\\-/g, "-");

  if (onRender) {
    html += "</div>";
  }

  return html;
};