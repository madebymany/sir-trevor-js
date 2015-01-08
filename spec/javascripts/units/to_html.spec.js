"use strict";

describe("toHTML", function(){

  it("converts links to HTML", function(){
    var markdown = "[test](http://google.com)",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<p><a href='http://google.com'>test</a></p>");
  });

  it("converts blockquotes to HTML", function(){
    var markdown = "> Test",
        html = SirTrevor.toHTML(markdown, "Quote");

    expect(html).toBe("Test");
  });

  it("converts italics to HTML", function(){
    var markdown = '_test_',
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<p><i>test</i></p>");
  });

  it("converts bolds to HTML", function(){
    var markdown = "**test**",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<p><b>test</b></p>");
  });

  it("converts bold and italics to HTML", function(){
    var markdown = "**test** and _testing_",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<p><b>test</b> and <i>testing</i></p>");
  });

  it("doesn't mess up on links with _ in", function(){
    var markdown = SirTrevor.toMarkdown("http://google.com/_ and this is_ more text http://google.com/_", "Text"),
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).not.toMatch(/<i>/);
  });

  it("converts a bold in the middle of a word", function(){
    var md = "Da**id backfire**",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<p>Da<b>id backfire</b></p>");
  });

  it("converts an italic in the middle of a word", function(){
    var md = "Da_id backfire_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<p>Da<i>id backfire</i></p>");
  });

  it("converts double sets of italics correctly", function(){
    var md = "_test__test_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<p><i>test</i><i>test</i></p>");
  });

  it("converts double sets of bolds correctly", function(){
    var md = "**test****test**",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<p><b>test</b><b>test</b></p>");
  });

  it("correctly encodes dashes", function(){
    var md = "Hand-crafted",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<p>Hand-crafted</p>");
  });

  it("strips newlines in bold tags", function(){
    var md = "**Test\n\n**",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<p><b>Test</b></p>");
  });

  it("strips newlines in italic tags", function(){
    var md = "_Test\n\n_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<p><i>Test</i></p>");
  });

  it("strips newlines in links", function(){
    var md = "[Test\n\n](http://google.com)",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<p><a href='http://google.com'>Test</a></p>");
  });

  it("strips preceding spaces in italic tags", function(){
    var md = "_ Test_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<p><i>Test</i></p>");
  });

  it("will ignore encoded italic tags", function(){
    var md = "_Test\\_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<p>_Test_</p>");
  });

  it("strips preceding spaces in bold tags", function(){
    var md = "** Test**",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<p><b>Test</b></p>");
  });

  it("cleans up tabs", function(){
    var md = "\t",
        html = SirTrevor.toHTML(md, "Text");

        expect(html).toBe("<p>&nbsp;&nbsp;&nbsp;&nbsp;</p>");
  });
});
