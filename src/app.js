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

// вынести в отдельный файл
const parseRssItems = (textHtml) => {
  const domParser = new DOMParser();
  const html = domParser.parseFromString(
    textHtml,
    'text/xml',
  );

  const isParserError = html.querySelector('parsererror');
  if (isParserError) {
    throw new Error('rssForm.errors.rssNotValid');
  }

  const channel = html.querySelector('channel');
  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;
  const id = uniqueId();

  const items = channel.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemDescription = item.querySelector('description').textContent;
    const url = item.querySelector('link').textContent;
    const postId = uniqueId();
    return {
      id: postId,
      feedId: id,
      title: itemTitle,
      description: itemDescription,
      url,
    };
  });

  return [{ id, title, description }, posts];
};

const updateRssItems = (url, watchedState, updateTimeout = 5000) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`;
  return axios
    .get(proxyUrl)
    .catch(() => { // никогда не отработает из-за особенности ответа от прокси
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
            watchedState.uiState.readedPosts.push(buttonId);
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
  const state = { // разбить на form, rss, modal (postId)
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
      readedPosts: [], // изменить на Set так как будут дубликаты
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
