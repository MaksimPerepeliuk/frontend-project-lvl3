import * as yup from "yup";
import onChange from "on-change";
import { rssFormRender, rssItemsRender } from "./view.js";
import axios from "axios";

const validate = (url, rssUrls) => {
  const schema = yup
    .string()
    .required()
    .url("rssForm.errors.urlNotValid")
    .notOneOf(rssUrls, "rssForm.errors.urlExist");

  return schema.validate(url);
};

const getItems = (html) => {
  const channels = html.querySelectorAll("channel");
  const feeds = [];
  const posts = [];
  channels.forEach((channel, id) => {
    const title = channel.querySelector("title").textContent;
    const describe = channel.querySelector("description").textContent;
    feeds.push({ id, title, describe });
    const items = channel.querySelectorAll("item");
    items.forEach((item) => {
      const title = item.querySelector("title").textContent;
      const describe = item.querySelector("description").textContent;
      const link = item.querySelector("link").textContent;
      posts.push({ feedId: id, title, describe, link });
    });
  });

  return [feeds, posts];
};

export default () => {
  const state = {
    rssForm: {
      isValid: null,
      error: null,
      urls: [],
    },
    rssItems: {
      feeds: [],
      posts: [],
    },
  };

  const form = document.querySelector("form");
  const input = document.querySelector("#url-input");
  const feedback = document.querySelector(".feedback");

  const watchedRssFormState = onChange(
    state.rssForm,
    rssFormRender({ form, input, feedback })
  );

  const feedContainer = document.querySelector(".feeds");
  const postContainer = document.querySelector(".posts");

  const watchedRssItemsState = onChange(
    state.rssItems,
    rssItemsRender({ feedContainer, postContainer })
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get("url");

    validate(url, state.rssForm.urls)
      .then(() => {
        watchedRssFormState.error = false;
        watchedRssFormState.isValid = true;
        watchedRssFormState.urls.push(url);
      })
      .catch((err) => {
        watchedRssFormState.error = err.message;
        watchedRssFormState.isValid = false;
        return Promise.reject();
      })
      .then(() => {
        const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`;
        return axios.get(proxyUrl);
      })
      .then((response) => {
        const domParser = new DOMParser();
        const htmlDocument = domParser.parseFromString(
          response.data.contents,
          "text/xml"
        );
        const [ feeds, posts ] = getItems(htmlDocument);
        watchedRssItemsState.feeds = feeds;
        watchedRssItemsState.posts = posts;
      })
      .catch((err) => console.log(err));
  });
};
