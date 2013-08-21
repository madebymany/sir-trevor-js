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

    expect(html).toBe("<em>test</em>");
  });

  it("converts bolds to HTML", function(){
    var markdown = "**test**",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<strong>test</strong>");
  });

  it("converts bold and italics to HTML", function(){
    var markdown = "**test** and _testing_",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<strong>test</strong> and <em>testing</em>");
  });

  it("converts underlines to HTML", function(){
    var markdown = '~test~',
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<u>test</u>");
  });

  it("converts bold underlines to HTML", function(){
    var markdown = '**~test~**',
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<strong><u>test</u></strong>");
  });

  it("converts newlines to HTML", function(){
    var markdown = "hello!\n\nhello!",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("hello!<br>hello!");
  });

  it("doesn't mess up on links with _ in", function(){
    var markdown = SirTrevor.toMarkdown("http://google.com/_ and this is_ more text http://google.com/_", "Text"),
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).not.toMatch(/em/);
  });

  it("converts a bold in the middle of a word", function(){
    var md = "Da**id backfire**",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("Da<strong>id backfire</strong>");
  });

  it("converts an italic in the middle of a word", function(){
    var md = "Da_id backfire_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("Da<em>id backfire</em>");
  });

  it("correctly encodes dashes", function(){
    var md = "Hand-crafted",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("Hand\-crafted");
  });
});