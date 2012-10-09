# Sir Trevor JS

A rebuild of the ITV news editor, with the Javascript pulled out of Ruby gem and separated into it's own project for easy use with any server-side language. 

## Features

- Don't store any HTML in database
- Flexible and intuitive interface
- Easy to extend / customise
- Drag and drop block re-ordering

## Quick Start

Grab the `sir-trevor.js` or `sir-trevor.min.js` file from the `lib` directory. This is the core Sir Trevor instance with the default Formatters and BlockTypes.

Include a reference to `sir-trevor.css` in your head, located in the `lib` folder. 

``` html
<link rel="stylesheet" href="sir-trevor.css" type="text/css" media="screen" charset="utf-8">
```

Create an instance of SirTrevor.Editor as follows (always wrap it in a document ready block)

``` html
<script>
  $(function(){
    new SirTrevor.Editor({
      el: $('.sir-trevor')
    });
  });
</script>
```

Your HTML should look something like this:

``` html
<form>
  <textarea class="sir-trevor"></textarea>
  <input type="submit">
</form>
```

You can limit the types of Blocks in the editor by passing a `blockTypes` array through to the editor instance as follows:

``` html
<script>
  $(function(){
    new SirTrevor.Editor({
      el: $('.sir-trevor'),
      blockTypes: ['Text', 'Quote'] // This instance will now only have these types available to it
    });
  });
</script>
```

Your SirTrevor editor instance will be bound to the submission of it's parent form element. On submission of the form the editor will validate and then serialise all of the Blocks on the page, storing the resulting JSON into the `<textarea>` you provided. You can them do as you wish with this on your server-side processing. 
  
A `SirTrevor.Editor` accepts the following options:

``` javascript  
{
  baseCSSClass: "sir-trevor",
  defaultType: "Text",
  spinner: {
    className: 'spinner',
    lines: 9, 
    length: 6, 
    width: 2, 
    radius: 5, 
    color: '#000', 
    speed: 1.4, 
    trail: 57, 
    shadow: false
  },
  marker: {
    baseCSSClass: "marker",
    buttonClass: "button",
    addText: "Click to add:",
    dropText: "Drop to place content"
  },
  formatBar: {
    baseCSSClass: "formatting-control"
  },
  blockLimit: 0,
  blockTypeLimits: {},
  uploadUrl: '/attachments',
  baseImageUrl: '/sir-trevor-uploads/'
}
```

Changing the `baseCSSClass` will break **all** the default CSS. Be careful.

## Flow

### Loading data:

- Parse JSON
- Create new blocks from the JSON representation
- `render` each new block
- Call the `loadData` function on each block
- Call the `onBlockRender` method after render

### Submission of form

For each block within each `SirTrevor.Editor` instance:

- Run validation (calls default or overwritten `validate` function)
- If the validation passes, run the `toData` function (default or overwritten). `toData` will save the state of the block onto itself. 

Once all blocks have run through this sequence the complete JSON state is serialised onto the instances `$el`.  

## Structure 

### Blocks

The editor itself is made up of Blocks. Sir Trevor comes bundled with the following Blocks out of the box:

- Text
- Quote
- Unordered List
- Image (simple)
- Gallery

There are more blocks available in the dedicated Blocks repository, [available here](https://github.com/madebymany/sir-trevor-blocks) 

### Formatters

Rich text block types (Text, Quote, Lists etc) use an *ultra* simple formatting system. The formatters allow for the styling of the content in these blocks. Out of the box, Sir Trevor ships with the following formatters:

- Bold
- Italic
- Link
- Unlink

## Extending Sir Trevor

For a well commented version of a Block, check out our [example Block](https://github.com/madebymany/sir-trevor-js/blob/master/examples/javascript/example_block.js) that you can use a base.

### Creating your own Blocks

A Block in it's simplest form is made up of some HTML markup, a function that tells it how to render from the JSON data (`loadData`) and a function that tells it how to get serialised into JSON (`toData`).  

A BlockType is defined as follows:

``` javascript
SirTrevor.Blocks.Example = SirTrevor.Block.extend({ 
  // Variables to be modfified
  
  className: 'new-block', // String; CSS class given to block
  title: 'New Block', // String; title displayed 
  limit: 0, // Integer; default block limit per editor instance
  editorHTML: '<div></div>', // String or Function; for HTML to be rendered inside the block
  dropzoneHTML: '<div class="dropzone"></div>', // String; HTML for the dropzone  
  toolbarEnabled: true, // Boolean; show this block in the new Blocks toolbar
  dropEnabled: false, // Boolean; Enable drop capabilities for this block

  loadData: function(data) {},
  toData: function(){},
  onDrop: function(transferData){},
  onContentPasted: function(ev){},
  
  onBlockRender: function(){},
  beforeBlockRender: function(){},
  
  toMarkdown: function(markdown){ return markdown; },
  toHTML: function(html){ return html; },
  
});
```
    
#### The loadData function

By default we don't provide a `loadData` method for each Block Type, this is because each block will have different requirements for how to transform the JSON data into the block to be edited. 

`loadData` has `this` bound to the block being rendered and *not* the BlockType. It gets passed `data` which is the JSON block data representation. 

An example `loadData` function is as follows:

``` javascript
loadData: function(data) {
  this.$$('input').val(data.cite); // See 'Elements' below for more on this.$$()
}
```

Remember, loadData is fired if data exists on the block when re-rendering. 

#### The toData function

`toData` is designed to take the block and all of it's inputs and save the blocks state as JSON on a data attribute on the block. By default the `toData` function will work with a variety of inputs, content editable blocks and selects. However, the `toData` function as it stands may not meet your block requirements, so it may be necessary to override this function.  

#### Saving / Retrieving data on the Block

We provide some helper methods for saving and retrieving data on the Block. 

`setData(data)` will save the data provided onto the block and update the data reference on the block
`getData()` will return you an object containing the current state of data on the block
`to_json()` will give you the blocks data and type, formatted for saving to JSON

#### Elements

When we render a block, we set quite a few element shorthands.  

``` javascript
$el       // Refers to whole block
el        // $el[0]
$editor    // The inner editor portion of the block, where your editorHTML is wrapped up
$dropzone // The dropzone HTML
``` 
    
Also, we set shorthands for a selecting elements

``` javascript
$('selector')       // equivalent to $el.find('selector')
$$('selector')      // equivalent to $editor.find('selector')
```    

#### Uploading

Out of the box there is a very generic uploading function that should allow you to take some form data and send it up to your server. 

## Contributing

We use the amazing [Grunt](https://github.com/gruntjs/grunt) for building out distributed javascript and Jasmine for testing..


## Licence

Sir Trevor is released under the MIT license:

www.opensource.org/licenses/MIT
