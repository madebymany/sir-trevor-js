var SirTrevor = require('../../node_modules/sir-trevor');
require('../stylesheets/example.scss');

(function() {

  SirTrevor.setDefaults({
    iconUrl: document.body.getAttribute('icon-url')
  });

  new SirTrevor.Editor({
    el: document.querySelector(".js-sir-trevor-instance"),
    blockTypes: ["Text", "List", "Video", "Quote", "Iframe"],
    defaultType: ['Text']
  });
})();