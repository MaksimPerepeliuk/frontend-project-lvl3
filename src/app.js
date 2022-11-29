import * as yup from "yup";
import onChange from "on-change";
import render from "./view.js";
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
    const description = channel.querySelector("description").textContent;
    feeds.push({ id, title, description });
    const items = channel.querySelectorAll("item");
    items.forEach((item) => {
      const title = item.querySelector("title").textContent;
      const description = item.querySelector("description").textContent;
      const url = item.querySelector("link").textContent;
      posts.push({ feedId: id, title, description, url });
    });
  });

  return [feeds, posts];
};

export default () => {
  const state = {
    rssFeeds: {
      state: "filling", // processing, finished, failed
      error: null,
      urls: [],
      data: {
        feeds: [],
        posts: [],
      },
    },
  };

  const elements = {
    form: document.querySelector("form"),
    input: document.querySelector("#url-input"),
    submitButton: document.querySelector(".btn"),
    feedback: document.querySelector(".feedback"),
    feedContainer: document.querySelector(".feeds"),
    postContainer: document.querySelector(".posts"),
  };

  const watchedState = onChange(state.rssFeeds, render(elements));

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get("url");

    validate(url, state.rssFeeds.urls)
      .then(() => {
        watchedState.state = "processing";
      })
      .catch((err) => {
        watchedState.state = "failed";
        throw new Error(err.message);
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
        const isParserError = htmlDocument.querySelector('parsererror');
        if (isParserError) {
          throw new Error('rssForm.errors.rssNotValid');
        }
        const [feeds, posts] = getItems(htmlDocument);
        watchedState.data.feeds = [...feeds, ...watchedState.data.feeds];
        watchedState.data.posts = [...posts, ...watchedState.data.posts];
        watchedState.urls.push(url);
        watchedState.state = 'finished';
      })
      .catch((err) => {
        watchedState.state = "failed";
        watchedState.error = err.message;
      });
  });
};
