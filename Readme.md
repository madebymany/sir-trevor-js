# Sir Trevor JS

_Intro Needed_

A rebuild of the ITV news editor, with the Javascript pulled out of Ruby gem and separated into it's own project for easy use with any server-side language. 

# Quick Start

Grab the `sir-trevor.js` or `sir-trevor.min.js` file from the `lib` directory. This is the core Sir Trevor instance with the default Formatters and BlockTypes.

# Structure 

## BlockTypes

The editor itself is made up of Blocks. Sir Trevor comes bundled with the following BlockTypes out of the box:

- Text
- Quote
- Unordered List
- Image (simple)
- Gallery

There are more blocks available in the dedicated Blocks repository, [available here](https://github.com/madebymany/sir-trevor-blocks) 

## Blocks

A Block will always belong to a BlockType and inherits some of the methods and properties of the BlockType. A Block will be rendered when the user selects a new BlockType from the marker bar, or when we're rendering the content from JSON. 

## Formatters

Rich text block types (Text, Quote, Lists etc) use an *ultra* simple formatting system. The formatters allow for the styling of the content in these blocks. Out of the box, Sir Trevor ships with the following formatters:

- Bold
- Italic
- Link
- Unlink

# Extending Sir Trevor



