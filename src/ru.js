import i18next from "i18next";

i18next.init({
  lng: "ru",
  debug: true,
  resources: {
    ru: {
      translation: {
        rssForm: {
          success: "RSS успешно загружен",
          errors: {
            urlNotValid: "Ссылка должна быть валидным URL",
            urlExist: "RSS уже существует",
          },
        },
      },
    },
  },
});

export default i18next.t;
