// Toggle 선택 상태 변경
const toggleButtons = document.querySelectorAll(".td-toggle");

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest(".td-toggle-group");

    if (!group) {
      return;
    }

    const buttonsInGroup = group.querySelectorAll(".td-toggle");

    buttonsInGroup.forEach((item) => {
      item.classList.remove("is-active");
    });

    button.classList.add("is-active");
  });
});

// Scene 화면 전환
const sceneButtons = document.querySelectorAll("[data-go]");
const scenes = document.querySelectorAll("[data-scene]");

function showScene(sceneName) {
  scenes.forEach((scene) => {
    const isTargetScene = scene.dataset.scene === sceneName;
    scene.classList.toggle("is-active", isTargetScene);
  });
}

sceneButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetScene = button.dataset.go;
    showScene(targetScene);
  });
});