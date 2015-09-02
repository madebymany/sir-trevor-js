Building blocks
===

Blocks are built up of primitives which provide pieces of functionality.

At the moment support there are primitives which provide support for each of the blocks that 

**Primitives currently available:**

- Text Area - text
- Input field - input
- Image Upload - image

## Building a block

When building a block using primitives you'll want need to add various attributes to your editorHTML.

Here's the most basic example showing a textarea.

```
<div name="textarea1" data-primitive="text" />
```

These are the 2 required fields for a primitive. Firstly the type of primitive and secondly the name.

- **data-primitive** - type of primitive
- **name** - reference and json name field for the primitive

## editorHTML

```
editorHTML = '
<div>
  <label>Body</label>
  <div data-primitive="text" name="body"></div>
  <label>Value</label>
  <input type="text" data-primitive="input" name="value" />
</div>
';
```

## Configuring a text area

There are certain settings that you can set on a primitive.

```
<div name="title" 
     data-primitive="text" 
     data-required="true" 
     data-formattable="true" />
```

> The above will add a **text** primitive, which is required for the block to be saved. The primitive will be added with a reference of **title** and also be saved with the same name. The primitive will also be formattable using a formatbar that will appear.

### Format bar options

When a textarea has `data-formattable` enabled it will show a format bar when text is selected. The default options for this will be set in SirTrevor.config. If you wish to override you can do so that the block level, but also at a primitive level

```
// Editor HTML
<div>
  <div name="text1" data-primitive="text" data-formattable="true"></div>
  <div name="text2" data-primitive="text" data-formattable="true"></div>
  <div name="text3" data-primitive="text" data-formattable="true"></div>
  <div name="text4" data-primitive="text"></div>
</div>

SirTrevor.config.formatBar.available = ['bold', 'italic', 'link', 'unlink'];

primitiveOptions: {
  default: {
  	formatBar: ['bold', 'italic'],
  },
  text1: {
    formatBar: ['italic']
  }
}
```

- **text1** - italic
- **text2** - bold, italic
- **text3** - bold, italic, link, unlink
- **text4** - shows no format bar

### scribeOptions

Options to be used when creating the Scribe editor. There are default options and when using plugins further options might need to be specified.

```
primitiveOptions: {
  default: {
    scribeOptions: {
      allowBlockElements: false,
      tags: {
        p: false
      }
    }
  }
}

```

### configureScribe

Function to be run after Scribe editor has been created.

```
primitiveOptions: {
  text1: {
    configureScribe: {
      function(scribe) {
        scribe.use(new ScribeListBlockPlugin(this));
      }
    }
  }
}
```

## Generic options

### Field validation

To validate a field you can pass a function that will be run when data is saved. This function will return true or false.

```
primitiveOptions: {
  text1: {
    validate: function() {
      return this.el.value.length < 144
    }
  }
}
```

## Dynamic creation

If you prefer to create your primitives dynamically then you can do so. You'll wither pass a template to the 

```
var TextField = require('./primitives/text-field');

newFields = [];

onBlockRender = function() {
  var field = new TextField('<input type="text" data-primitive="input" />', 'Default text', {}, this);
  this.newFields.push(field);
  field = new InputField('<input type="text" data-primitive="input" />', 'Default value', {}, this);
  this.newFields.push(field);
}

_serializeData = function() {
  var data = {};
  this.newFields.forEach((field) => {
    data[field.ref] = field.getData();
  });
  return data;
}
```
