SirTrevor.Locales.pt = {
  general: {
    delete: "Elimina?",
    drop: "Arrastar __block__ aqui",
    paste: "Ou cola o URL aquí",
    upload: "...ou selecionar um fichero",
    close: "Fechar",
    position: "Posicionar",
    wait: "Por favor, espere..."
  },
  errors: {
    title: "Sugerio os seguientes erros :",
    validation_fail: "Bloque __type__ inválido",
    block_empty: "__name__ no debe estar vacío",
    type_missing: "Necessitas um bloque de __type__",
    required_type_empty: "Um bloque obligatorio de tipo __type__ está vazio",
    load_fail: "Sugerio um problema a cargar os dados do documento",
    link_empty: "This link appears to be empty",
    link_invalid: "The link is not valid"
  },
  formatters: {
    link: {
      prompt: "Introduz um link",
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
      title: "Imagem",
      upload_error: "Sugerio um problema com o upload da imagem"
    },
    video: {
      title: "Vídeo",
      drop_title: "URL do Vídeo"
    },
    tweet: {
      title: "Tweet",
      drop_title: "URL do Tweet",
      fetch_error: "Sugerio um problema na busca da sua tweet"
    },
    embedly: {
      title: "Embebido",
      fetch_error: "Sugerio um problema na busca do video",
      key_missing: "Necessitamos a chave do API Embedly"
    },
    heading: {
      title: "Título"
    }
  }
};
