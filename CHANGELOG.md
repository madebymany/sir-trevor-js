# Changelog

## 0.4.x

### 0.4.0

* Refactored each instance to have it's own mediator object
* Added a new block manager that handles block creation, deletion etc
* Clean up the block store with more logical names
* Cleaned up file names to have `-` conventions
* Simplified the editor store

## 0.3.x

### 0.3.3

* Refactored upload triggers, now handled by Ajaxable mixin
* Slight change to the `Image` block – no longer sets the button title to 'Please wait...' on upload
* Escaped `class` names and other minor fixes so including ST doesn't blow up IE 7 / 8
* Added `toMarkdown` `aggresiveHTMLStrip` default to not strip tags that have whitespace after the opening `<` character (#168)
* Pass the block to the `block:remove` trigger
* Add the block ID to all other block triggers

### 0.3.2

* Added new controllable mixin for adding new functionality to blocks (https://github.com/madebymany/sir-trevor-js/pull/118)
* Removed Source Sans from the CSS file
* Added a dataType: 'json' to the uploader
* Added a `getInstance` method to retrieve editor instances
* Fixed `.st-text-block--heading` class to have `min-height: 0` not `auto`.
* Added mailto support to the link regex

### 0.3.1

* Localise titles of the tweet & heading blocks
* Defer the execution of internationalising the delete text, drop text, upload text and list block cite text until Sir Trevor has intialised.
* Add the heading title to the locales files
* Swap the onBlockRender method to be executed *after* the block $el is appended onto the DOM by emitting an event
* Added a `destroy` method for all Renderable views
* Added a `destroy` and `reinitialize` method for a `SirTrevor.Editor` instance
* Modified the Video block to allow for more providers to be added.

### 0.3.0

* I18n support (in EN / DE) using the new `i18n.t` helper
* Support for the I18next library (optional dependency)
* Add support for Underscore >= 1.5.0
* Support for multi-worded block types like OrderedList through snake casing on the block type
* Better markdown support for italics and bolds, fixes issue with markdown hating on spaces.
* Improved paste support, stripping out comments and other nasties
* Improved the format bar positioning
* Moved the Eventable block into it's own repository
* Remove blocks instantly if they are empty
* Add method to define if a block is empty (`isEmpty`)
* Fix the formatters not being called in `to-html.js` and `to-markdown.js`
* Use all inputs in `toData` not just `text` inputs. Note inputs must have a `name` attribute to be included in the serialized content.
