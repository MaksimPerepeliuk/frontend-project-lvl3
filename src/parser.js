import { uniqueId } from 'lodash';

export default (textHtml) => {
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
