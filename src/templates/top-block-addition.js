"use strict";

const BLOCK_ADDITION_TEMPLATE = require("./block-addition");

module.exports = () => {
  return `
    <div id="st_top" class="st-top-controls">
      ${BLOCK_ADDITION_TEMPLATE()}
    </div>
  `;
}
