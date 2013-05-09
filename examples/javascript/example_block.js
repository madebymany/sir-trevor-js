/*
  An example of a SirTrevor.Block
  --
  Author: C J Bell @ madebymany
*/

SirTrevor.Blocks.Example = SirTrevor.Block.extend({ 
  
  // String; the title displayed in the toolbar
  title: "Example",            
  
  // String; the class name of the block type 
  className: "example",    
  
  // Integer; the overall number of blocks of this type that can be added 
  limit: 0,                     

  // Boolean; show this blockType of the toolbar
  toolbarEnabled: true,         
  
  // Booleam; shall we set this block up for drag and drop
  dropEnabled: false,           

  // String or Function; The HTML for the inner portion of the editor block
  // In this example, the editorHTML is an editable input div (like we use for a TextBlock)
  // editorHTML: "<div></div>",   
  // editorHTML must return a string (if it's a function)
  editorHTML: function() {      
    return "<div class='text-block' contenteditable='contenteditable'></div>";  
  }, 
  
  // String; The HTML for the dropzone
  // Not required unless dropEnabled is true
  dropzoneHTML: "<div class='dropzone'><p>Drop content here yo!</p></div>",
  
  // Element shorthands
  // --
  // this.$el 
  // this.el
  // this.$editor
  // this.$dropzone
  // this.$()       (same as this.$el.find(''))
  // this.$$()      (same as this.$editor.find(''))

  // Bound variables
  // --
  // this.instance  (A SirTrevor.Editor instance)
  
  // Helper methods 
  // --
  // this.save()
  // this.loading() 
  // this.ready()
  // this.uploadAttachment(file, callback) 
  // this.remove()
  
  // Function; provide a custom validator.
  // By default, we use a validator that checks for a class of 'required' on each input. 
  // This function *MUST* return true or false (whether it's valid or not)
  validate: function(){
    return true;
  },
  
  // Function; Executed on render of the block if some data is provided. 
  // LoadData gives us a means to convert JSON data into the editor dom
  // In this example we convert the text from markdown to HTML and show it inside the element
  // returns null
  loadData: function(data){
    this.$('.text-block').html(this.instance._toHTML(data.text, this.type));
  },
  
  // Function; Executed on save of the block, once the block is validated
  // toData expects a way for the block to be transformed from inputs into JSON data
  // The default toData function provides a pretty comprehensive way of turning data into JSON
  // In this example we take the text data and save it to the data object on the block
  toData: function(){
    // Grab the data from the block (it's always stored on the data attr)
    var dataStruct = this.$el.data('block'); 
    
    // Grab the content input
    var content = this.$('.text-block').html(); 
    
    if (content.length > 0) {
      // Convert it to markdown and store under the 'text' object
      dataStruct.data.text = this.instance._toMarkdown(content, this.type); 
    }
  },
  
  // Function; Executed once content has been dropped onto the dropzone of this block
  // Only required if you have enabled dropping and have provided a dropzone for this block
  // Always is passed the ev.transferData object from the drop
  // Please see the image block (https://github.com/madebymany/sir-trevor-js/blob/master/src/blocks/image.js) for an example
  onDrop: function(transferData) {},
  
  // Function; Executed once content has been pasted into the block or any input field with the class 'paste-block'
  // The default onContentPasted function strips all the HTML from a text-block, as shown here.
  onContentPasted: function(ev) {
    // Convert to markdown and then to HTML to strip all unwanted markup
    this.$('.text-block').html(this.instance._toHTML(this.instance._toMarkdown(textBlock.html(), this.type)));
  },
  
  // Function; Hook executed at the end of the block rendering method. 
  // Useful for initialising extra pieces of UI or binding extra events.
  // In this example we add an extra button, just because.
  onBlockRender: function() {
    this.$el.append($('<button>', {
      click: function() {
        alert('Yo dawg, you clicked my button');
      }
    }));
  },
  
  // Function; Optional hook method executed before the rendering of a block
  // Beware, $el and any shorthand element variables won't be setup here.
  beforeBlockRender: function() {},
  
  // Function; Any extra markdown parsing can be defined in here. 
  // Executed on the _.toMarkdown function of a SirTrevor.Editor instance
  // Returns; String (Required)
  toMarkdown: function(markdown) {
    return markdown.replace(/^(.+)$/mg,"> $1");
  },
  
  // Function; Any extra HTML parsing can be defined in here. 
  // Executed on the _.toHTML function of a SirTrevor.Editor instance
  // Returns; String (Required)
  toHTML: function(html) {
    return html;
  }
});
