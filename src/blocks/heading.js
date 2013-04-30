/*
  Text Block
*/
SirTrevor.Blocks.Heading = SirTrevor.Block.extend({

  type: 'Heading',

  editorHTML: '<h1 class="st-required st-text-block" contenteditable="true"></h1>',

  loadData: function(data){
    this.$$('.st-text-block').html(SirTrevor.toHTML(data.text, this.type));
  }
});