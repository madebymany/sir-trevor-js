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

  it("converts newlines to HTML", function(){
    var markdown = "hello!\n\nhello!",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("hello!<br>hello!");
  });

  it("converts strikes to HTML", function(){
    var markdown = "~~test strike~~",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<strike>test strike</strike>");
  });

  it("doesn't mess up on links with _ in", function(){
    var markdown = "http://google.com/_ and this is_ more text http://google.com/_",
        html = SirTrevor.toHTML(markdown, "Text");
    expect(html).not.toMatch(/em/);
  });

});