import * as yup from "yup";
import onChange from "on-change";
import render from "./view.js";
import axios from "axios";

const validate = (url, rssFormState) => {
  const schema = yup
    .string()
    .required()
    .url("rssForm.errors.urlNotValid")
    .notOneOf(rssFormState.urls, "rssForm.errors.urlExist");

  return schema.validate(url);
};

export default () => {
  const state = {
    rssForm: {
      isValid: null,
      error: null,
      urls: [],
    },
  };

  const form = document.querySelector("form");
  const input = document.querySelector("#url-input");
  const feedback = document.querySelector(".feedback");

  const watchedState = onChange(state, render({ form, input, feedback }));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get("url");

    validate(url, state.rssForm)
      .then(() => {
        watchedState.rssForm.error = null;
        watchedState.rssForm.isValid = true;
        watchedState.rssForm.urls.push(url);
      })
      .catch((err) => {
        watchedState.rssForm.error = err.message;
        watchedState.rssForm.isValid = false;
      });
  });
};
