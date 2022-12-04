import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './view';

const validate = (url, rssUrls) => {
  const schema = yup
    .string()
    .required()
    .url('rssForm.errors.urlNotValid')
    .notOneOf(rssUrls, 'rssForm.errors.urlExist');

  return schema.validate(url);
};

const parseRssItems = (html) => {
  const channels = html.querySelectorAll('channel');
  const feeds = [];
  const posts = [];
  channels.forEach((channel) => {
    const title = channel.querySelector('title').textContent;
    const description = channel.querySelector('description').textContent;
    const feedId = uniqueId();
    feeds.push({ id: feedId, title, description });
    const items = channel.querySelectorAll('item');
    items.forEach((item) => {
      const itemTitle = item.querySelector('title').textContent;
      const itemDescription = item.querySelector('description').textContent;
      const url = item.querySelector('link').textContent;
      const postId = uniqueId();
      const postData = {
        id: postId,
        feedId,
        title: itemTitle,
        description: itemDescription,
        url,
      };
      posts.push(postData);
    });
  });

  return { feeds, posts };
};

const updateRssItems = (url, watchedState, interval = 5000) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`;
  return axios
    .get(proxyUrl)
    .catch(() => {
      throw new Error('rssForm.errors.networkErr');
    })
    .then((response) => {
      const domParser = new DOMParser();
      const htmlDocument = domParser.parseFromString(
        response.data.contents,
        'text/xml',
      );
      const isParserError = htmlDocument.querySelector('parsererror');
      if (isParserError) {
        throw new Error('rssForm.errors.rssNotValid');
      }
      const rssItems = parseRssItems(htmlDocument);
      const feedTitles = watchedState.data.feeds.map(({ title }) => title);
      const postTitles = watchedState.data.posts.map(({ title }) => title);
      const newFeeds = rssItems.feeds.filter(
        ({ title }) => !feedTitles.includes(title),
      );
      const newPosts = rssItems.posts.filter(
        ({ title }) => !postTitles.includes(title),
      );
      if (newPosts.length > 0) {
        watchedState.data.feeds = [...newFeeds, ...watchedState.data.feeds];
        watchedState.data.posts = [...newPosts, ...watchedState.data.posts];
        const modalButtons = document.querySelectorAll('[data-bs-target="#modal"]');
        modalButtons.forEach((button) => {
          button.addEventListener('click', () => {
            watchedState.uiState.readedPosts.push(button.dataset.id);
          });
        });
      }
      setTimeout(() => updateRssItems(url, watchedState, interval), interval);
    })
    .catch((err) => {
      if (!watchedState.urls.includes(url)) {
        watchedState.state = 'failed';
        watchedState.error = err.message;
        throw err;
      }
      setTimeout(() => updateRssItems(url, watchedState, interval), interval);
    });
};

export default () => {
  const state = {
    rssFeeds: {
      state: 'filling',
      error: null,
      urls: [],
      data: {
        feeds: [],
        posts: [],
      },
      uiState: {
        readedPosts: [],
      },
    },
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    submitButton: document.querySelector('.rss-form .btn'),
    feedback: document.querySelector('.feedback'),
    feedContainer: document.querySelector('.feeds'),
    postContainer: document.querySelector('.posts'),
  };

  const watchedState = onChange(state.rssFeeds, render(elements, state));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const url = formData.get('url');
    validate(url, state.rssFeeds.urls)
      .then(() => {
        watchedState.state = 'processing';
      })
      .catch((err) => {
        watchedState.state = 'failed';
        throw new Error(err.message);
      })
      .then(() => updateRssItems(url, watchedState))
      .then(() => {
        watchedState.urls.push(url);
        watchedState.state = 'finished';
      })
      .catch((err) => {
        watchedState.state = 'failed';
        watchedState.error = err.message;
      });
  });
};
