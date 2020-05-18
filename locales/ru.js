SirTrevor.Locales.ru = {
  general: {
    'delete':           'Удалить?',
    'drop':             'Перетащите __block__ сюда',
    'paste':            'Или введите URL здесь',
    'upload':           '... или выберите файл',
    'close':            'Закрыть',
    'position':         'Позиция',
    'wait':             'Пожалуйста, подождите ...'
  },
  errors: {
    'title': "У вас есть следующие ошибки:",
    'validation_fail': "__type__ блок является недопустимым",
    'block_empty': "__name__ не должно быть пустым",
    'type_missing': "Вы должны иметь блок типа __type__",
    'required_type_empty': "Нужный тип блока __type__ пуст",
    'load_fail': "Есть проблема при загрузке содержимого документа",
    'link_empty': "This link appears to be empty",
    'link_invalid': "The link is not valid"
  },
  formatters: {
    link: {
      'prompt': "Введите ссылку",
      'new_tab': "Opens in a new tab",
      'message': "The URL you entered appears to be __type__. Do you want to add the required “__prefix__” prefix?",
      types: {
        'email': 'an email address',
        'telephone': 'a telephone number',
        'url': 'a link'
      }
    }
  },
  blocks: {
    text: {
      'title': "Текст"
    },
    list: {
      'title': "Cписок"
    },
    quote: {
      'title': "Цитата",
      'credit_field': "Слова"
    },
    image: {
      'title': "Изображение",
      'upload_error': "Есть проблемы с загрузкой"
    },
    video: {
      'title': "Видео",
      'drop_title': "URL видео"
    },
    tweet: {
      'title': "Твит",
      'drop_title': "URL Твит",
      'fetch_error': "Есть проблемы с загрузкой"
    },
    embedly: {
      'title': "Вставка",
      'fetch_error': "Есть проблемы с вставлением",
      'key_missing': "API должен присутствовать"
    },
    heading: {
      'title': 'Заголовок'
    }
  }
};
