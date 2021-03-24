SirTrevor.Locales.fr = {
  general: {
    delete: "Suppression ?",
    drop: "Glissez __block__ ici",
    paste: "Ou copiez le lien ici",
    upload: "...ou choisissez un fichier",
    close: "fermer",
    position: "Position",
    wait: "Veuillez patienter...",
    yes: "Oui",
    no: "Non"
  },
  errors: {
    title: "Vous avez l'erreur suivante :",
    validation_fail: "Bloc __type__ est invalide",
    block_empty: "__name__ ne doit pas être vide",
    type_missing: "Vous devez avoir un bloc de type __type__",
    required_type_empty: "Un bloc requis de type __type__ est vide",
    load_fail: "Il y a un problème avec le chargement des données du document",
    link_empty: "This link appears to be empty",
    link_invalid: "The link is not valid"
  },
  formatters: {
    link: {
      prompt: "Entrez un lien",
      new_tab: "Opens in a new tab",
      message:
        "The URL you entered appears to be __type__. Do you want to add the required “__prefix__” prefix?",
      types: {
        email: "an email address",
        telephone: "a telephone number",
        url: "a link"
      }
    },
    superscript: {
      prompt: "Attribut de titre (facultatif)"
    }
  },
  blocks: {
    text: {
      title: "Texte"
    },
    list: {
      title: "Liste"
    },
    quote: {
      title: "Citation",
      credit_field: "Auteur"
    },
    image: {
      title: "Image",
      upload_error: "Il y a un problème avec votre téléchargement"
    },
    video: {
      title: "Vidéo",
      drop_title: "URL de la Vidéo"
    },
    tweet: {
      title: "Tweet",
      drop_title: "URL de Tweet",
      fetch_error:
        "Un problème est survenu lors de la récupération de votre tweet"
    },
    embedly: {
      title: "Embedly",
      fetch_error:
        "Un problème est survenu lors de la récupération de votre embed",
      key_missing: "Une clé API pour Embedly doit être présente"
    },
    heading: {
      title: "Titre"
    }
  }
};
