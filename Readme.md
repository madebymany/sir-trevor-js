# Sir Trevor

[![Build Status](https://travis-ci.org/madebymany/sir-trevor-js.png?branch=master)](https://travis-ci.org/madebymany/sir-trevor-js/)

Conceived by [Andrew Sprinz](http://github.com/andrewsprinz). Maintained by [Chris Bell](http://github.com/cjbell88) & [Andrew Walker](http://github.com/ninjabiscuit).

## Upgrade guide from v0.5

- [Changelog](https://github.com/madebymany/sir-trevor-js/blob/master/CHANGELOG.md)
- Migration docs [0.4-0.5](https://github.com/madebymany/sir-trevor-js/blob/master/docs/migrations/0.4-0.5.md), [0.5-0.6](https://github.com/madebymany/sir-trevor-js/blob/master/docs/migrations/0.5-0.6.md)

### Quick start

The recomended way to install Sir Trevor in your project is using npm. This will install all the files required in the `build` directory for the module.

```
npm install sir-trevor
```

Note: Sir Trevor is distributed combined with its dependencies. If you wish to modify Sir Trevor you will want to clone the repository and use the [Compiling instructions](#compiling) below.

HTML

```html
<form><textarea class="js-st-instance"></textarea></form>
```

Javascript

```js
import SirTrevor from "sir-trevor";

const editor = new SirTrevor.Editor({
  el: document.querySelector(".js-st-instance"),
  defaultType: "Text",
  iconUrl: "build/sir-trevor-icons.svg"
});
```

### Full docs

[http://madebymany.github.io/sir-trevor-js/docs.html]

### Plain JS

- [Download the latest release](https://github.com/madebymany/sir-trevor-js/zipball/master)
- ...or clone the repo: `git clone git://github.com/madebymany/sir-trevor-js.git`

### Implementations

1. [Sir Trevor Rails](http://github.com/madebymany/sir-trevor-rails)
2. [Umbraco 7](https://github.com/mindrevolution/SirTrevor-for-Umbraco), [Umbraco 6](http://our.umbraco.org/projects/backoffice-extensions/skybrud-sir-trevor-editor)
3. [CakePHP](http://github.com/martinbean/cakephp-sir-trevor-plugin)
4. [Wordpress](https://github.com/neyre/sir-trevor-wp), [Wordpress](https://github.com/raffij/sir-trevor-wordpress)
5. [Laravel](https://github.com/caouecs/Laravel4-SirTrevorJS)
6. [Django](https://github.com/philippbosch/django-sirtrevor)
7. [Yii Framework](https://github.com/DrMabuse23/yii2-sir-trevor-js)
8. [Symfony2](https://github.com/EDSI-Tech/SirTrevorBundle)

## Custom blocks

We are keeping a list of [custom block repos here](https://github.com/madebymany/sir-trevor-js/wiki/Custom-blocks). See the documentation to find out more about [adding your own block types](http://madebymany.github.io/sir-trevor-js/docs.html#4).

## Browser support

Sir Trevor is only tested on the following modern browsers:

- IE11+ (https://github.com/madebymany/sir-trevor-js/tree/ie-support)
- Chrome 51+
- Safari 9+
- Firefox 47+

ECMAScript 6 shims are bundled in by default; if the platform you wish to run on doesn't support ECMAScript 5 APIs you'll need to shim those yourself.

Sir Trevor uses [The Guardian's scribe](https://github.com/guardian/scribe) for rich text editing. Double check their [browser support](https://github.com/guardian/scribe#browser-support) if your application relies on full RTE support.

## Contributing

See the [roadmap](https://github.com/madebymany/sir-trevor-js/wiki/Roadmap) and read a little about [the philosophy](https://github.com/madebymany/sir-trevor-js/wiki/Philosophy) guiding development.

### Customising the way it looks

We use [Sass](http://sass-lang.com/) for our styles, if you'd like to change the default styling please fork the repository and make changes to the Sass before recompiling.

### Customising blocks

Block Types can also easily be added to the `SirTrevor.Blocks` object. You can also override the default block types (Text, Image, Tweet, Video, Quote, Heading & List) at any time. See the documentation to find out more about [adding your own block types](http://madebymany.github.io/sir-trevor-js/docs.html#4).

### Compiling

Tests are run as part of compilation process, which require `chromedriver` to be installed on
the machine where you are running the compilation. If you're running Homebrew on OSX this can
be installed via `brew install chromedriver`.

Before getting started please be sure to install the necessary dependencies via npm:

`$ npm install`

When completed, we have a couple of preset scripts:

`$ npm run dev`

This compiles for development, and watches source files to recompile when you change something.

`$ npm test`

Runs the linter and test suite, just like the CI server does.

`$ npm run dist`

Concatenates scripts, compiles the Sass, runs the Jasmine tests and minifies the project.

Please ensure any pull requests have relevant Jasmine tests (where applicable).

## Current browser support tests

matrix:

- BROWSER_NAME='chrome' BROWSER_VERSION='51' PLATFORM='OSX 10.10'
- BROWSER_NAME='chrome' BROWSER_VERSION='51' PLATFORM='Windows 7'
- BROWSER_NAME='firefox' BROWSER_VERSION='46' PLATFORM='OSX 10.10'
- BROWSER_NAME='firefox' BROWSER_VERSION='46' PLATFORM='Windows 7'

## Building gh-pages docs

```
cd website
npm install
bundle exec rake publish PROJECT_ROOT=./ ALLOW_DIRTY=true
```

## License

Sir Trevor is released under the MIT license:
[opensource.org/licenses/MIT](http://opensource.org/licenses/MIT)
