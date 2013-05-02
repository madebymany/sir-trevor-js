SirTrevor.toMarkdown = function(content, type) {
  var markdown;

  markdown = content.replace(/\n/mg,"")
                    .replace(/<a.*?href=[""'](.*?)[""'].*?>(.*?)<\/a>/g,"[$2]($1)")         // Hyperlinks
                    .replace(/<\/?b>/g,"**")
                    .replace(/<\/?STRONG>/g,"**")                   // Bold
                    .replace(/<\/?i>/g,"_")
                    .replace(/<\/?EM>/g,"_");                        // Italic

  // Use custom formatters toMarkdown functions (if any exist)
  var formatName, format;
  for(formatName in this.formatters) {
    if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
      format = SirTrevor.Formatters[formatName];
      // Do we have a toMarkdown function?
      if (!_.isUndefined(format.toMarkdown) && _.isFunction(format.toMarkdown)) {
        markdown = format.toMarkdown(markdown);
      }
    }
  }

  // Do our generic stripping out
  markdown = markdown.replace(/([^<>]+)(<div>)/g,"$1\n\n$2")                                 // Divitis style line breaks (handle the first line)
                 .replace(/(?:<div>)([^<>]+)(?:<div>)/g,"$1\n\n")                            // ^ (handle nested divs that start with content)
                 .replace(/(?:<div>)(?:<br>)?([^<>]+)(?:<br>)?(?:<\/div>)/g,"$1\n\n")        // ^ (handle content inside divs)
                 .replace(/<\/p>/g,"\n\n\n\n")                                               // P tags as line breaks
                 .replace(/<(.)?br(.)?>/g,"\n\n")                                            // Convert normal line breaks
                 .replace(/&nbsp;/g," ")                                                     // Strip white-space entities
                 .replace(/&lt;/g,"<").replace(/&gt;/g,">");                                 // Encoding


  // Use custom block toMarkdown functions (if any exist)
  var block;
  if (SirTrevor.Blocks.hasOwnProperty(type)) {
    block = SirTrevor.Blocks[type];
    // Do we have a toMarkdown function?
    if (!_.isUndefined(block.prototype.toMarkdown) && _.isFunction(block.prototype.toMarkdown)) {
      markdown = block.prototype.toMarkdown(markdown);
    }
  }

  // Strip remaining HTML
  markdown = markdown.replace(/<\/?[^>]+(>|$)/g, "");

  return markdown;
};