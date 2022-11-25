export default ({ form, input, feedback }) =>
  (path, value, previousValue) => {
    if (path === "rssForm.error") {
      if (value) {
        input.classList.add("is-invalid");
        feedback.classList.remove("text-success");
        feedback.classList.add("text-danger");
        feedback.textContent = value;
      } else {
        input.classList.remove("is-invalid");
        feedback.classList.remove("text-danger");
        feedback.classList.add("text-success");
        feedback.textContent = "RSS успешно загружен";
        form.reset();
        input.focus();
      }
    }
  };
