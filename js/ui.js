const toggleButtons = document.querySelectorAll(".td-toggle");

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest(".td-toggle-group");
    const buttonsInGroup = group.querySelectorAll(".td-toggle");

    buttonsInGroup.forEach((item) => {
      item.classList.remove("is-active");
    });

    button.classList.add("is-active");
  });
});