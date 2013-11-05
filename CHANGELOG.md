# Changelog

## 0.3.0

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