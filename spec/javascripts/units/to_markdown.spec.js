describe("toMarkdown", function(){

  it("converts links to markdown", function(){
    var html = "<a href='http://google.com'>test</a>",
        markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("[test](http://google.com)");
  });

  it("coverts bold to markdown", function(){
    var html = "<strong>testing</strong>",
        markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("**testing**");
  });

  it("coverts italic to markdown", function(){
    var html = "<em>testing</em>",
        markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("_testing_");
  });

  it("coverts paragraphs to newlines", function(){
    var html = "<p>testing</p>",
        markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("testing\n\n\n\n");
  });

  it("coverts br's to newlines", function(){
    var html = "testing<br>",
        markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("testing\n\n");
  });

  it("correctly encodes * characters", function(){
    var html = "test*",
        markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("test\\*");
  });

  it("correctly encodes _ characters", function(){
    var html = "test_",
        markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("test\\_");
  });

  it("correctly encodes - characters", function(){
    var html = "test-something",
        markdown = SirTrevor.toMarkdown(html, "Text");

    expect(markdown).toBe("test\\-something");
  });

});