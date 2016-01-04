"use strict";

const BLOCK_ADDITION_TEMPLATE = require("./block-addition");
const BLOCK_REPLACER_TEMPLATE = require("./block-replacer");

module.exports = (editor_html) => {
  return `
    <div class='st-block__inner'>
      ${ editor_html }
    </div>
    ${ BLOCK_REPLACER_TEMPLATE() }
    ${ BLOCK_ADDITION_TEMPLATE() }
  `;
};
