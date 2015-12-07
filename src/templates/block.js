"use strict";

const BLOCK_ADDITION_TEMPLATE = require("./block-addition");

module.exports = (editor_html) => {
  return `
    <div class='st-block__inner'>
      ${ editor_html }
    </div>
    ${ BLOCK_ADDITION_TEMPLATE }
  `;
};
