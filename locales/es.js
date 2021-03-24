SirTrevor.Locales.es = {
  general: {
    delete: "¿Eliminar?",
    drop: "Arrastrar __block__ ici",
    paste: "O copie el enlace aquí",
    upload: "...o seleccione un fichero",
    close: "cerrar",
    position: "Posición",
    wait: "Por favor, espere..."
  },
  errors: {
    title: "Aparecerá el siguiente error :",
    validation_fail: "Bloque __type__ inválido",
    block_empty: "__name__ no debe estar vacío",
    type_missing: "Debe tene un tipo de bloque __type__",
    required_type_empty: "Un bloque obligatorio de tipo __type__ está vacío",
    load_fail: "Hay un problema con la carga de datos",
    link_empty: "This link appears to be empty",
    link_invalid: "The link is not valid"
  },
  formatters: {
    link: {
      prompt: "Introduce un link",
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
      prompt: "Atributo de título (opcional)"
    }
  },
  blocks: {
    text: {
      title: "Texto"
    },
    list: {
      title: "Lista"
    },
    quote: {
      title: "Cita",
      credit_field: "Autor"
    },
    image: {
      title: "Imagen",
      upload_error: "Hay un problema con la subida"
    },
    video: {
      title: "Vídeo",
      drop_title: "URL del Vídeo"
    },
    tweet: {
      title: "Tweet",
      drop_title: "Tweet URL",
      fetch_error: "Se produjo un problema al recuperar su tweet"
    },
    embedly: {
      title: "Embebido",
      fetch_error: "Se produjo un problema al recuperar su video",
      key_missing: "Debe tener asociada una clave API"
    },
    heading: {
      title: "Título"
    }
  }
};
