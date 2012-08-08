
function convertToMarkdown(html, type) {
  
  var markdown;
  
  markdown = html.replace(/\n/mg,"")
                 .replace(/<a.*?href=[""'](.*?)[""'].*?>(.*?)<\/a>/g,"[$2]($1)")         // Hyperlinks
                 .replace(/<\/?b>/g,"**").replace(/<\/?STRONG>/g,"**")                   // Bold
                 .replace(/<\/?i>/g,"_").replace(/<\/?EM>/g,"_");                        // Italic

  if(type == "UnorderedList") {
    markdown = markdown.replace(/<\/li>/mg,"\n")
                       .replace(/<\/?[^>]+(>|$)/g, "")
                       .replace(/^(.+)$/mg," - $1");
  }
  
  if(type == "OrderedList") {
    markdown = markdown.replace(/<\/li>/mg,"\n")
                       .replace(/<\/?[^>]+(>|$)/g, "")
                       .replace(/^(.+)$/mg," 1. $1");
  }
  
  markdown = markdown.replace(/([^<>]+)(<div>)/g,"$1\n\n$2")                                 // Divitis style line breaks (handle the first line)
                 .replace(/(?:<div>)([^<>]+)(?:<div>)/g,"$1\n\n")                            // ^ (handle nested divs that start with content)
                 .replace(/(?:<div>)(?:<br>)?([^<>]+)(?:<br>)?(?:<\/div>)/g,"$1\n\n")        // ^ (handle content inside divs)
                 .replace(/<\/p>/g,"\n\n\n\n")                                               // P tags as line breaks
                 .replace(/<(.)?br(.)?>/g,"\n\n")                                            // Convert normal line breaks
                 .replace(/&nbsp;/g," ")                                                     // Strip white-space entities 
                 .replace(/&lt;/g,"<").replace(/&gt;/g,">")                                  // Encoding
                 .replace(/<\/?[^>]+(>|$)/g, "");                                            // Strip remaining HTML
      
  if(type == "BlockQuote") markdown = markdown.replace(/^(.+)$/mg,"> $1");

  return markdown;
}

function toHTML(markdown) {
  markdown = markdown.replace(/^ - (.+)$/mg,"<li>$1</li>");
  markdown = markdown.replace(/^ 1. (.+)$/mg,"<li>$1</li>");
  return  markdown.replace(/^\> (.+)$/mg,"$1")                                       // Blockquotes
                  .replace(/\n\n/g,"<br>")                                           // Give me some <br>s
                  .replace(/\[(.+)\]\((.+)\)/g,"<a href='$2'>$1</a>")                 // Links
                  .replace(/(?:\*\*)([^*|_]+)(?:\*\*)/mg,"<b>$1</b>")                // Bold
                  .replace(/(?:_)([^*|_]+)(?:_)/mg,"<i>$1</i>");                     // Italic
}