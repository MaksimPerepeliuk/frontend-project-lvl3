import t from "./ru.js";

export const rssFormRender = ({ form, input, feedback }) => {
  return (path, value) => {
    if (path === "error") {
      if (value) {
        input.classList.add("is-invalid");
        feedback.classList.remove("text-success");
        feedback.classList.add("text-danger");
        feedback.textContent = t(value);
      } else {
        input.classList.remove("is-invalid");
        feedback.classList.remove("text-danger");
        feedback.classList.add("text-success");
        feedback.textContent = t("rssForm.success");
        form.reset();
        input.focus();
      }
    }
  };
};

export const rssItemsRender = ({ feedContainer, postContainer }) => {
  return (path, value, prevValue) => {
    console.log(path, value, prevValue);
    if (path === "feeds") {
      const card = document.createElement("div");
      card.classList.add("card", "border-0");
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");
      const cardTitle = document.createElement("h2");
      cardTitle.classList.add("card-title", "h4");
      cardTitle.textContent = "Фиды";
      cardBody.append(cardTitle);
      card.append(cardBody);
      const feedList = document.createElement('ul');
      feedList.classList.add('list-group', 'border-0', 'rounded-0');
      feedContainer.append(card);
      // вынести в функцию
      const feedItems = value.map(({ title, describe }) => {
        const li = document.createElement("li");
        li.classList.add('list-group-item', 'border-0', 'rounded-0');
        const itemTitle = document.createElement('h3');
        itemTitle.classList.add('h6', 'm-0');
        itemTitle.textContent = title;
        const itemDescribe = document.createElement('p');
        itemDescribe.classList.add('m-0', 'small', 'text-black-50');
        itemDescribe.textContent = describe;
        li.append(itemTitle);
        li.append(itemDescribe);
        return li;
      });
      feedList.append(...feedItems);
      feedContainer.append(feedList);
    }
  };
};
