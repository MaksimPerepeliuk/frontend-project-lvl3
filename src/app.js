import * as yup from 'yup';
import 'bootstrap';
import onChange from 'on-change';
import axios from 'axios';
import render from './view';
import parseRssItems from './parser';

const validate = (url, rssUrls) => {
  const schema = yup
    .string()
    .required()
    .url('rssForm.errors.urlNotValid')
    .notOneOf(rssUrls, 'rssForm.errors.urlExist');

  return schema.validate(url);
};

const updateRssItems = (url, watchedState, updateTimeout = 5000) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`;
  return axios
    .get(proxyUrl)
    .catch(() => {
      throw new Error('rssForm.errors.networkErr');
    })
    .then((response) => {
      const [feed, posts] = parseRssItems(response.data.contents);

      const feedTitles = watchedState.rssItems.feeds.map(({ title }) => title);
      const postTitles = watchedState.rssItems.posts.map(({ title }) => title);

      const newFeed = feedTitles.includes(feed.title) ? null : feed;
      const newPosts = posts.filter(({ title }) => !postTitles.includes(title));

      if (newPosts.length > 0) {
        watchedState.rssItems.feeds = [newFeed, ...watchedState.rssItems.feeds];
        watchedState.rssItems.posts = [...newPosts, ...watchedState.rssItems.posts];

        const modalButtons = document.querySelectorAll('[data-bs-target="#modal"]');
        modalButtons.forEach((button) => {
          button.addEventListener('click', () => {
            const buttonId = button.dataset.id;
            watchedState.uiState.readedPostsIds.add(buttonId);
            watchedState.rssItems.modalCurrentPostId = buttonId;
          });
        });
      }
      setTimeout(() => updateRssItems(url, watchedState, updateTimeout), updateTimeout);
    })
    .catch((err) => {
      if (!watchedState.rssForm.urls.includes(url)) {
        watchedState.rssForm.state = 'failed';
        watchedState.rssForm.error = err.message;
        throw err;
      }
      setTimeout(() => updateRssItems(url, watchedState, updateTimeout), updateTimeout);
    });
};

export default () => {
  const state = {
    rssForm: {
      state: 'filling',
      error: null,
      urls: [],
    },
    rssItems: {
      feeds: [],
      posts: [],
      modalCurrentPostId: null,
    },
    uiState: {
      readedPostsIds: new Set(),
    },
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    submitButton: document.querySelector('.rss-form .btn'),
    feedback: document.querySelector('.feedback'),
    feedContainer: document.querySelector('.feeds'),
    postContainer: document.querySelector('.posts'),
    modalElements: {
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      modalFullArticle: document.querySelector('.full-article'),
    },
  };

  const watchedState = onChange(state, render(elements, state));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const url = formData.get('url');
    validate(url, state.rssForm.urls)
      .then(() => {
        watchedState.rssForm.state = 'processing';
      })
      .catch((err) => {
        watchedState.rssForm.state = 'failed';
        throw new Error(err.message);
      })
      .then(() => updateRssItems(url, watchedState))
      .then(() => {
        watchedState.rssForm.urls.push(url);
        watchedState.rssForm.state = 'finished';
      })
      .catch((err) => {
        watchedState.rssForm.state = 'failed';
        watchedState.rssForm.error = err.message;
      });
  });
};
