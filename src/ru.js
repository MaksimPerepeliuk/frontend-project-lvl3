import i18next from 'i18next';

const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru: {
      translation: {
        rssForm: {
          success: 'RSS успешно загружен',
          errors: {
            urlNotValid: 'Ссылка должна быть валидным URL',
            urlExist: 'RSS уже существует',
            rssNotValid: 'Ресурс не содержит валидный RSS',
            networkErr: 'Ошибка сети',
          },
        },
        rssFeeds: {
          posts: 'Посты',
          feeds: 'Фиды',
          modalOpenBtn: 'Просмотр',
        },
      },
    },
  },
});

export default i18nextInstance.t;
