# Sir Trevor

[![Build Status](https://travis-ci.org/madebymany/sir-trevor-js.png?branch=master)](https://travis-ci.org/madebymany/sir-trevor-js/)

![Sir Trevor in action](https://raw.github.com/madebymany/sir-trevor-js/master/examples/sir-trevor.gif)

Conceived by [Andrew Sprinz](http://github.com/andrewsprinz). Maintained by [Chris Bell](http://github.com/cjbell88) & [Andrew Walker](http://github.com/ninjabiscuit).

## Quick start

Full documentation can be found [here](http://madebymany.github.io/sir-trevor-js/docs.html).

### Plain JS

- [Download the latest release](https://github.com/madebymany/sir-trevor-js/zipball/master)
- ...or clone the repo: `git clone git://github.com/madebymany/sir-trevor-js.git`
- ...or install with [Bower](http://bower.io/) ``bower install sir-trevor-js``

### Implementations

1. [Sir Trevor Rails](http://github.com/madebymany/sir-trevor-rails)
2. [Umbraco 7](https://github.com/mindrevolution/SirTrevor-for-Umbraco), [Umbraco 6](http://our.umbraco.org/projects/backoffice-extensions/skybrud-sir-trevor-editor)
3. [CakePHP](http://github.com/martinbean/cakephp-sir-trevor-plugin)
4. [Wordpress](https://github.com/raffij/sir-trevor-wordpress)
5. [Laravel](https://github.com/caouecs/Laravel4-SirTrevorJS)
6. [Django](https://github.com/philippbosch/django-sirtrevor)
7. [Yii Framework](https://github.com/DrMabuse23/yii2-sir-trevor-js)
8. [Symfony2](https://github.com/EDSI-Tech/SirTrevorBundle)

## Custom blocks

We are keeping a list of [custom block repos here](https://github.com/madebymany/sir-trevor-js/wiki/Custom-blocks). See the documentation to find out more about [adding your own block types](http://madebymany.github.io/sir-trevor-js/docs.html#4).

## Browser support

Sir Trevor is only tested on the following modern browsers:

- IE10+
- Chrome 25+
- Safari 5+
- Firefox 16+

ECMAScript 6 shims are bundled in by default; if the platform you wish to run on doesn't support ECMAScript 5 APIs you'll need to shim those yourself.

## Dependencies

It's up to you:

* Bring your own jQuery or Zepto (and have it put itself on `window.$`) and use `sir-trevor.js` / `sir-trevor.min.js`
* Or if you're using Browserify yourself, `npm install sir-trevor` and `require('sir-trevor')` it as you would expect.

## Contributing

See the [roadmap](https://github.com/madebymany/sir-trevor-js/wiki/Roadmap) and read a little about [the philosophy](https://github.com/madebymany/sir-trevor-js/wiki/Philosophy) guiding development.

### Customising the way it looks

We use [Sass](http://sass-lang.com/) for our styles, if you'd like to change the default styling please fork the repository and make changes to the Sass before recompiling.

### Customising blocks

Block Types can also easily be added to the ``SirTrevor.Blocks`` object. You can also override the default block types (Text, Image, Tweet, Video, Quote, Heading & List) at any time. See the documentation to find out more about [adding your own block types](http://madebymany.github.io/sir-trevor-js/docs.html#4).

### Compiling

Before getting started please be sure to install the necessary dependencies via npm:

``$ npm install``

When completed, we have a couple of preset scripts:

``$ npm run dev``

This compiles for development, and watches source files to recompile when you change something.

``$ npm test``

Runs the linter and test suite, just like the CI server does.

``$ npm run dist``

Concatenates scripts, compiles the Sass, runs the Jasmine tests and minifies the project.

Please ensure any pull requests have relevant Jasmine tests (where applicable).

## License

Sir Trevor is released under the MIT license:
[opensource.org/licenses/MIT](http://opensource.org/licenses/MIT)
