"use strict";

describe("toHTML", function(){

  it("converts links to HTML", function(){
    var markdown = "[test](http://google.com)",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<div><a href='http://google.com'>test</a></div>");
  });

  it("converts blockquotes to HTML", function(){
    var markdown = "> Test",
        html = SirTrevor.toHTML(markdown, "Quote");

    expect(html).toBe("Test");
  });

  it("converts italics to HTML", function(){
    var markdown = '_test_',
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<div><i>test</i></div>");
  });

  it("converts bolds to HTML", function(){
    var markdown = "**test**",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<div><b>test</b></div>");
  });

  it("converts bold and italics to HTML", function(){
    var markdown = "**test** and _testing_",
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).toBe("<div><b>test</b> and <i>testing</i></div>");
  });

  it("doesn't mess up on links with _ in", function(){
    var markdown = SirTrevor.toMarkdown("http://google.com/_ and this is_ more text http://google.com/_", "Text"),
        html = SirTrevor.toHTML(markdown, "Text");

    expect(html).not.toMatch(/<i>/);
  });

  it("converts a bold in the middle of a word", function(){
    var md = "Da**id backfire**",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<div>Da<b>id backfire</b></div>");
  });

  it("converts an italic in the middle of a word", function(){
    var md = "Da_id backfire_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<div>Da<i>id backfire</i></div>");
  });

  it("converts double sets of italics correctly", function(){
    var md = "_test__test_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<div><i>test</i><i>test</i></div>");
  });

  it("converts double sets of bolds correctly", function(){
    var md = "**test****test**",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<div><b>test</b><b>test</b></div>");
  });

  it("correctly encodes dashes", function(){
    var md = "Hand-crafted",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<div>Hand-crafted</div>");
  });

  it("strips newlines in bold tags", function(){
    var md = "**Test\n\n**",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<div><b>Test</b></div>");
  });

  it("strips newlines in italic tags", function(){
    var md = "_Test\n\n_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<div><i>Test</i></div>");
  });

  it("strips newlines in links", function(){
    var md = "[Test\n\n](http://google.com)",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<div><a href='http://google.com'>Test</a></div>");
  });

  it("strips preceding spaces in italic tags", function(){
    var md = "_ Test_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<div><i>Test</i></div>");
  });

  it("will ignore encoded italic tags", function(){
    var md = "_Test\\_",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<div>_Test_</div>");
  });

  it("strips preceding spaces in bold tags", function(){
    var md = "** Test**",
        html = SirTrevor.toHTML(md, "Text");

    expect(html).toBe("<div><b>Test</b></div>");
  });

  it("cleans up tabs", function(){
    var md = "\t",
        html = SirTrevor.toHTML(md, "Text");

        expect(html).toBe("<div>&nbsp;&nbsp;&nbsp;&nbsp;</div>");
  });
});
