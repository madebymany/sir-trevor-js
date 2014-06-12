Here are a few ways you can help make SirTrevor better!

# Contributing to SirTrevor

## Team members

[Chris Bell](https://github.com/cjbell88),
[Andy Walker](https://github.com/ninjabiscuit),
[Andrew Sprinz](https://github.com/andrewsprinz),
[Ilya Poropudas](https://github.com/ilyaporopudas)


## Using GitHub to report issues

To file a bug report, please visit the GitHub issues page. It's great if you can attach code (test cases and fixes for bugs, and test cases and a proposed implementation for features), but reproducible bug reports are also welcome.

## Feature requests

Feature requests are welcome. But take a moment to find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Please provide as much detail and context as possible.

## Cloning master and running the test suite

To get started contributing to SirTrevor, first clone the repository and make sure you can run the test suite.

If you're not familiar with Git, visit the Git homepage to download Git for your platform. You'll also need [npm](https://github.com/npm/npm) installed with [grunt](https://github.com/gruntjs/grunt) installed globally.

First, clone the repository:

$ git clone git@github.com:madebymany/sir-trevor-js.git
$ cd sir-trevor-js

Next, run ``npm install`` to grab all of the development dependencies.

To run the test suite and build SirTrevor run ``grunt`` in the terminal.

When making changes to the source code, run ``grunt watch`` to concatenate the Sass and JS files and run the tests on the fly.

Source code lives in the ``/src`` directory and edits should be made here rather than on the top level sir-trevor.js file.

## Documentation

You can find documentation on how to get started with SirTrevor and how to write custom blocks [here](http://madebymany.github.io/sir-trevor-js/).

The docs could always do with fleshing out with more detail and more examples so please feel free to dive in and help us make them better. The docs are located in the ``/website/source`` directory of the GitHub repository.

## Contributing to the SirTrevor code

Good pull requests - patches, improvements, new features - are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

Please ask first before embarking on any significant pull request (e.g. implementing features, refactoring code), otherwise you risk spending a lot of time working on something that the project's developers might not want to merge into the project. Check the [latest milestone](https://github.com/madebymany/sir-trevor-js/issues?milestone=2&state=open) for the most pressing issues that we'd like to address before the next version.

This contribution process is based on the Ruby on Rails contribution guide. In general, include tests with new features or bugfixes, work in a feature branch until you're ready to submit or discuss your code, then fork the repository, push to your fork, and issue a pull request.

Note: When submitting a pull request for code, please don't add documentation, rebuild the annotated source code, or rebuild the minified production file -- all of those tasks are done when cutting a new release.

Don’t get discouraged! We value all contributions and just because we didn't get back to you about your pull request straight away doesn't mean we don't care.

# Blocks

There is an ever growing collection of community created Sirtrevor blocks and we'd love to expand that even further. However it is unlikely that we'll be adding more blocks to the SirTrevor core. If you would like to create a block and open source it for the community, please create a separate repository for it. By all means let  us know about it (we love hearing about new blocks) and we'll include it in the [list of custom blocks](https://github.com/madebymany/sir-trevor-js/wiki/Custom-blocks) in the wiki.

See the documentation to find out more about [adding your own block types](http://madebymany.github.io/sir-trevor-js/docs.html#4).

# Implementations

SirTrevor saves json and relies on markdown parsers and third party image upload integrations. It was designed for use with Ruby on Rails and has an accompanying sir-trevor-rails project that eases the integration with that framework. If you'd like to work on integrating SirTrevor with your framework of choice we'd love to hear about it. The current list of integrations is listed in the [readme](https://github.com/madebymany/sir-trevor-js#implementations). Take a look at the sir-trevor-rails implementation for a starting point.

# Translations

We'd love SirTrevor to be available in as many languages as possible. If you would like to add a translations file it would be most welcome. Translations can be found in the ``/locales`` directory. Simply copy one of the existing translation files and replace the copy appropriately.

# Thats it

If you have further questions, contact one of the core team members or file an issue.