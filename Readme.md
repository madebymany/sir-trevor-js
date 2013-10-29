# Sir Trevor

[![Build Status](https://travis-ci.org/madebymany/sir-trevor-js.png?branch=master)](https://travis-ci.org/madebymany/sir-trevor-js/)

![Sir Trevor in action](https://raw.github.com/madebymany/sir-trevor-js/master/examples/sir-trevor.gif)

Conceived by [Andrew Sprinz](http://github.com/andrewsprinz‎). Maintained by [Chris Bell](http://github.com/cjbell88) & [Andrew Walker](http://github.com/ninjabiscuit).

## Quick start

Full documentation can be found [here](http://madebymany.github.io/sir-trevor-js/docs.html), or read more about [how the editor works](https://github.com/madebymany/sir-trevor-js/wiki/How-the-editor-works).

### Vanilla JS

1. [Download the latest release](https://github.com/madebymany/sir-trevor-js/zipball/master)
2. Clone the repo: `git clone git://github.com/madebymany/sir-trevor-js.git`
3. Install with [Bower](http://bower.io/) ``bower install sir-trevor-js``

### Implementations

1. [Sir Trevor Rails](http://github.com/madebymany/sir-trevor-rails)
2. [Umbraco]()

## Browser support

Sir Trevor is only tested on the following modern browsers:

1. IE10+
2. Chrome 25+
3. Safari 5+
4. Firefox 16+

## Dependencies

Sir Trevor requires [Underscore](http://underscorejs.org/) (or LoDash), [jQuery](http://jquery.com) (or Zepto) and [Eventable](https://github.com/madebymany/eventable).

## Contributing

See the [roadmap]() and read a little about [what ST is, and is not]().

### Customising

We use [Sass](http://sass-lang.com/) for our styles, if you'd like to change the default styling please fork the repository and [make changes to the Sass](https://github.com/madebymany/sir-trevor-js/wiki/Customising-the-default-styling) before recompiling.

### Custom blocks

Block Types can also easily be added to the ``SirTrevor.Blocks`` object. You can also override the defaulty block types (Text, Image, Tweet, Video, Quote, Heading & List) at any time. Please see the Wiki article about [adding your own block types](http://madebymany.github.io/sir-trevor-js/docs.html#4) for more information.

### Compiling

We use the awesome [Grunt](http://gruntjs.com/) for our build process. Before getting started please be sure to install the necessary dependencies via npm:

``$ npm install``

When completed you'll be able to run the various grunt commands provided:

``$ grunt``

Concatenates scripts, compiles the Sass, runs the Jasmine tests and minifies the project.

``$ grunt watch``

Convenience method while developing to compile the Sass files and concatenate the Javascript on save of a file in the ``/src`` directory.

Please ensure any pull requests have relevant Jasmine tests (where applicable).

## Licence

Sir Trevor is released under the MIT license:
[opensource.org/licenses/MIT](http://opensource.org/licenses/MIT)
