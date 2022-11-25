import * as yup from "yup";
import onChange from "on-change";

const validate = (url, rssFormState, cb) => {
  const schema = yup
    .string()
    .required()
    .url("Ссылка должна быть валидным URL")
    .notOneOf(rssFormState.urls, "RSS уже существует");

  schema
    .validate(url)
    .then((result) => cb({ isError: false, result: url }))
    .catch(({ message }) => cb({ isError: true, result: message }));
};

export default () => {
  const state = {
    rssForm: {
      isValid: null,
      error: null,
      urls: ["https://ru.hexlet.io/lessons.rss"],
    },
  };

  const form = document.querySelector("form");
  const input = document.querySelector("#url-input");
  const feedback = document.querySelector(".feedback");

  // render
  const watchedState = onChange(state, (path, value, previousValue) => {
    if (path === "rssForm.error") {
      if (value) {
        input.classList.add("is-invalid");
        feedback.classList.remove("text-success");
        feedback.classList.add("text-danger");
        feedback.textContent = state.rssForm.error;
      } else {
        input.classList.remove("is-invalid");
        feedback.classList.remove("text-danger");
        feedback.classList.add("text-success");
        feedback.textContent = "RSS успешно загружен";
        form.reset();
        input.focus();
      }
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get("url");
    const callbackValidate = ({ isError, result }) => {
      if (isError) {
        watchedState.rssForm.error = result;
        watchedState.rssForm.isValid = false;
      } else {
        watchedState.rssForm.error = null;
        watchedState.rssForm.isValid = true;
        watchedState.rssForm.urls.push(url);
      }
    };

    validate(url, state.rssForm, callbackValidate);
  });
};
