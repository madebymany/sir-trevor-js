"use strict";

module.exports = function({name, text, cmd, iconName}) {
  return `
    <button class="st-format-btn st-format-btn--${name} ${iconName ? "st-icon" : ""}" data-cmd="${cmd}">
      ${text}
    </button>
  `;
};
