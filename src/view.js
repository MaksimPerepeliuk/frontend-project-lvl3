import t from './ru';

const handleProcessState = (processState, elements) => {
  switch (processState) {
    case 'processing':
      elements.submitButton.disabled = true;
      break;

    case 'failed':
      elements.submitButton.disabled = false;
      break;

    case 'finished':
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = t('rssForm.success');
      elements.form.reset();
      elements.input.focus();
      elements.submitButton.disabled = false;
      break;

    case 'filling':
      elements.submitButton.disabled = false;
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderError = (value, elements) => {
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  elements.feedback.textContent = t(value);
};

const createSection = (titleText) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = titleText;
  cardBody.append(cardTitle);
  card.append(cardBody);

  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'border-0', 'rounded-0');

  return [card, feedList];
};

const postsRender = (posts, elements, uiState) => {
  const [card, postList] = createSection(t('rssFeeds.posts'));
  elements.postContainer.replaceChildren(card);

  const postItems = posts.map(({ id, title, url }) => {
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const link = document.createElement('a');
    link.href = url;
    link.classList.add(uiState.readedPosts.includes(id) ? 'fw-normal' : 'fw-bold');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = title;

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = t('rssFeeds.modalOpenBtn');

    li.append(link);
    li.append(button);

    return li;
  });

  postList.append(...postItems);
  elements.postContainer.append(postList);
};

const feedsRender = (feeds, elements) => {
  const [card, feedList] = createSection(t('rssFeeds.feeds'));
  elements.feedContainer.replaceChildren(card);

  const feedItems = feeds.map(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'rounded-0');

    const itemTitle = document.createElement('h3');
    itemTitle.classList.add('h6', 'm-0');
    itemTitle.textContent = title;

    const itemDescription = document.createElement('p');
    itemDescription.classList.add('m-0', 'small', 'text-black-50');
    itemDescription.textContent = description;

    li.append(itemTitle);
    li.append(itemDescription);

    return li;
  });

  feedList.append(...feedItems);
  elements.feedContainer.append(feedList);
};

const modalRender = (btnId, rssItems, modalElements) => {
  const { modalTitle, modalBody, modalFullArticle } = modalElements;
  const { title, description, url } = rssItems.posts.find(({ id }) => btnId === id);
  modalTitle.innerHTML = title;
  modalBody.innerHTML = description;
  modalFullArticle.href = url;
};

const uiStateRender = (value, rssItems) => {
  const readedPosts = rssItems.posts.filter(({ id }) => value.includes(id));
  readedPosts.forEach((post) => {
    const { id } = post;
    const button = document.querySelector(`[data-id="${id}"]`);
    const postLink = button.previousElementSibling;
    postLink.classList.remove('fw-bold');
    postLink.classList.add('fw-normal');
  });
};
// добавить отдельно handleModal
export default (elements, state) => {
  const inner = (path, value) => {
    switch (path) {
      case 'rssForm.state':
        handleProcessState(value, elements);
        break;

      case 'rssForm.error':
        renderError(value, elements);
        break;

      case 'rssItems.feeds':
        feedsRender(value, elements);
        break;

      case 'rssItems.posts':
        postsRender(value, elements, state.uiState);
        break;

      case 'rssItems.modalCurrentPostId':
        modalRender(value, state.rssItems, elements.modalElements);
        break;

      case 'uiState.readedPosts':
        uiStateRender(value, state.rssItems);
        break;

      default:
        break;
    }
  };

  return inner;
};
