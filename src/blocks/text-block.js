var template = '<div class="<%= className %>" contenteditable="true"></div>';

SirTrevor.Blocks.TextBlock = new SirTrevor.Block({ 
  title: "Text",
  className: "text-block",
  toolbarEnabled: true,
  dropEnabled: false,
  limit: 0,
  editorHTML: function() {
    return _.template(template, this);
  },
});