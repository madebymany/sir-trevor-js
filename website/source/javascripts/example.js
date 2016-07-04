//= require sir-trevor-js/build/sir-trevor

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