describe("toHTML", function(){

  it("converts links to HTML", function(){
    var markdown = "[test](http://google.com)",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<a href='http://google.com'>test</a>");
  });

  it("converts blockquotes to HTML", function(){
    var markdown = "> Test",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("Test");
  });

  it("converts italics to HTML", function(){
    var markdown = '_test_',
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<i>test</i>");
  });

  it("converts bolds to HTML", function(){
    var markdown = "**test**",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<b>test</b>");
  });

  it("converts bold and italics to HTML", function(){
    var markdown = "**test** and _testing_",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<b>test</b> and <i>testing</i>");
  });

  it("converts newlines to HTML", function(){
    var markdown = "hello!\nhello!",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("hello!<br>hello!");
  });

  it("doesn't mess up on links with _ in", function(){
    var markdown = SirTrevor.toMarkdown("http://google.com/_ and this is_ more text http://google.com/_", "Text"),
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).not.toMatch(/<i>/);
  });

  it("converts a bold in the middle of a word", function(){
    var md = "Da**id backfire**",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("Da<b>id backfire</b>");
  });

  it("converts an italic in the middle of a word", function(){
    var md = "Da_id backfire_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("Da<i>id backfire</i>");
  });

  it("converts double sets of italics correctly", function(){
    var md = "_test__test_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<i>test</i><i>test</i>");
  });

  it("converts double sets of bolds correctly", function(){
    var md = "**test****test**",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<b>test</b><b>test</b>");
  });

  it("correctly encodes dashes", function(){
    var md = "Hand-crafted",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("Hand\-crafted");
  });
});