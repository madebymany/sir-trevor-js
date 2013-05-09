# Sir Trevor JS

[![Build Status](https://travis-ci.org/madebymany/sir-trevor-js.png?branch=master)](https://travis-ci.org/madebymany/sir-trevor-js/)

A content agnostic editor from the CMS used by [ITV news](http://www.itv.com/news/)
See an [example](http://madebymany.github.com/sir-trevor-js/)

## Features

- Don't store any HTML in database
- Flexible and intuitive interface. Anyone can use it..
- Easy to extend / customise
- Drag and drop with block re-ordering


## Quick Start
### Installation

Download the latest distribution via the [downloads page](https://github.com/madebymany/sir-trevor-js/downloads)

You then need to drag the following into your project..

```
./images
sir-trevor.css
sir-trevor.js or sir-trevor.min.js
```

And Sir Trevor needs some dependencies, these are included in the folder under `ext`, but you can also get them below..

[jQuery v1.9.1](https://raw.github.com/madebymany/sir-trevor-js/master/public/javascripts/jquery.js)
[Underscore.js 1.3.3](https://github.com/madebymany/sir-trevor-js/blob/master/public/javascripts/underscore.js)

### Setup

Add the stylesheet to your page's head

``` html
<link rel="stylesheet" href="sir-trevor.css" type="text/css" media="screen" charset="utf-8">
```

Create an instance of SirTrevor.Editor as follows (always wrap it in a jQuery document ready block)

``` html
<script>
  $(function(){
    new SirTrevor.Editor({
      el: $('.sir-trevor')
    });
  });
</script>
```

Then add a HTML form with a `sir-trevor` text element

``` html
<form>
  <textarea class="sir-trevor"></textarea>
  <input type="submit">
</form>
```

Thats it!

The SirTrevor editor instance will listen for 'submit' events to its parent element and will validate itself when the form is submitted.


## Block types

The editor itself is made up of Blocks. The default ones are..

- Text
- Quote
- Unordered List
- Image (simple)
- Gallery

There are more blocks available in the dedicated [Blocks repository](https://github.com/madebymany/sir-trevor-blocks)

### Custom block types

For a well commented version of a custom Block, check out our [example Block](https://github.com/madebymany/sir-trevor-js/blob/master/examples/javascript/example_block.js) that you can use a base.
Also see our wiki pages on [creating your own Block types](https://github.com/madebymany/sir-trevor-js/wiki/Creating your own Block types)


## Image Uploading

Out of the box there is a very generic uploading function that should allow you to take some form data and send it up to your server.
TODO: explain more complex image uploading

## More examples

See our [Wiki](https://github.com/madebymany/sir-trevor-js/wiki) for more code and examples

## Contributing

We use the amazing [Grunt](https://github.com/gruntjs/grunt) for building out distributed javascript and [Jasmine](http://pivotal.github.com/jasmine/) for testing..

You will need Node to build and run the tests.

First make sure you have all dependencies installed:

```
npm install # To install required javascript modules
```

You can run the test suite with a headless phantom js instance with

``` bash
./node_modules/grunt/bin/grunt jasmine
```

Alternatively, you can run it in the browser with

```bash
./node_modules/grunt/bin/grunt jasmine-browser
```

and visit [http://localhost:8000/BrowserRunner.html](http://localhost:8000/BrowserRunner.html).

And you can then build for distribution by running grunt

```
./node_modules/grunt/bin/grunt
```

Once built, you can then submit a pull request and the gods of code will scream your awesomeness, which will be heard for miles around.

## Licence

Sir Trevor is released under the MIT license:

www.opensource.org/licenses/MIT
