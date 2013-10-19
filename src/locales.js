SirTrevor.Locales = {
  en: {
    general: {
      'delete':           'Delete?',
      'drop':             'Drag __block__ here',
      'paste':            'Or paste URL here',
      'upload':           '...or choose a file',
      'validation_fail':  '__type__ block is invalid',
      'close':            'close',
      'position':         'Position',
      'empty_error':      '__name__ must not be empty',
      'type_error':       'You must have a block of type __type__',
      'empty_error':      'A required block type __type__ is empty',
      'error_heading':    'You have the following errors:',
      'load_error':       'There was a problem loading the contents of the document',
      'wait':             'Please wait...',
      'link':             'Enter a link',
    },
    blocks: {
      "text_type":                "Text",
      "unorderedlist_type":       "List",
      "blockquote_type":          "Quote",
      "blockquote_credit":        "Credit",
      "image_type":               "Image",
      "video_type":               "Video",
      "tweet_type":               "Tweet",
      "tweet_fail":               "There was a problem fetching your tweet",
      "embedly_type":             "Embedly"
    }
  },

  de: {
    general: {
      'delete':           'Löschen?',
      'drop':             '__block__ hier ablegen',
      'paste':            'Oder Adresse hier einfügen',
      'upload':           '...oder Datei auswählen',
      'validation_fail':  'Block __type__ ist ungültig',
      'close':            'Schließen',
      'position':         'Position',
      'empty_error':      '__name__ darf nicht leer sein',
      'type_error':       'Blöcke mit Typ __type__ sind hier nicht zulässig',
      'empty_error':      'Angeforderter Block-Typ __type__ ist leer',
      'error_heading':    'Die folgenden Fehler sind aufgetreten:',
      'load_error':       'Es wurde ein Problem beim Laden des Dokumentinhalts festgestellt',
      'wait':             'Bitte warten...',
      'link':             'Link eintragen'
    },
    blocks: {
      "text_type":                "Text",
      "unorderedlist_type":       "Liste (unsortiert)",
      "blockquote_type":          "Zitat",
      "blockquote_credit":        "Quelle",
      "image_type":               "Bild",
      "video_type":               "Video",
      "tweet_type":               "Tweet",
      "tweet_fail":               "Es wurde ein Problem beim Laden des Tweets festgestellt",
      "embedly_type":             "Embedly"
    }
  }
}

if (window.i18n === undefined) {
  // Minimal i18n stub that only reads the English strings
  SirTrevor.log("Using i18n stub");
  window.i18n = {
    t: function(key, options) {
      var parts, ns, key, str;
      parts = key.split(':');
      ns = parts[0];
      key = parts[1]
      str = SirTrevor.Locales[SirTrevor.LANGUAGE][ns][key];
      if (str.indexOf('__') > 0) {
        _.each(options, function(value, opt) {
          str = str.replace('__' + opt + '__', value);
        });
      }
      return str;
    }
  }
} else {
  SirTrevor.log("Using i18next");
  // Only use i18next when the library has been loaded by the user, keeps
  // dependencies slim
  i18n.init({ resStore: SirTrevor.Locales, fallbackLng: SirTrevor.LANGUAGE,
              ns: { namespaces: ['general', 'blocks'], defaultNs: 'general' }
  });
}
