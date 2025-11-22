const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const addButton = (episodeInfo) => {
  if (!episodeInfo.url) return;
  const button = document.createElement("button");
  button.id = "watchlistReviewButton";
  button.textContent = "📝";
  button.title =
    "エピソードのレビューを書く\n(右クリックでエピソードページを開く)";
  button.addEventListener("click", () => {
    window.open(episodeInfo.url + "/review", "_blank");
  });
  button.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    window.open(episodeInfo.url, "_blank");
  });
  document.body.appendChild(button);
};
const addDialog = (titleInfo, episodeInfo) => {
  const dialog = document.createElement("dialog");
  const dialogContent = document.createElement("div");
  const reviewButton = document.createElement("button");
  const closeButton = document.createElement("button");
  const message = document.createElement("p");

  dialog.id = "watchlistReviewDialog";
  dialogContent.id = "watchlistReviewDialogContent";
  message.id = "watchlistReviewMessage";
  reviewButton.id = "watchlistReviewSubmitButton";
  closeButton.id = "watchlistReviewCloseButton";

  message.textContent = `このエピソードをレビューしますか？\n${titleInfo.name}\nエピソード${episodeInfo.number} ${episodeInfo.name}`;
  reviewButton.textContent = "レビューする";
  closeButton.textContent = "閉じる";
  reviewButton.addEventListener("click", () => {
    window.open(episodeInfo.url + "/review", "_blank");
    dialog.close();
  });
  closeButton.addEventListener("click", () => {
    dialog.close();
  });

  dialogContent.appendChild(message);
  dialogContent.appendChild(reviewButton);
  dialogContent.appendChild(closeButton);
  dialog.appendChild(dialogContent);
  document.body.appendChild(dialog);
};
const showDialog = () => {
  if (!episodeInfo.url) return;
  const dialog = document.getElementById("watchlistReviewDialog");
  if (!dialog) return;
  dialog.showModal();
};

const updateButtonVisibility = () => {
  const video = document.querySelector("video");
  const button = document.getElementById("watchlistReviewButton");
  if (!button) return;
  if (video.paused || video.ended) {
    button.style.display = "flex";
  } else {
    button.style.display = "none";
  }
};
const attachVideoListeners = () => {
  const video = document.querySelector("video");
  if (!video) return;
  video.addEventListener("play", updateButtonVisibility);
  video.addEventListener("pause", updateButtonVisibility);
  video.addEventListener("ended", updateButtonVisibility);
  video.addEventListener("ended", showDialog);
  updateButtonVisibility();
};
