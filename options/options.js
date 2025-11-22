const saveSettings = (url, showReviewButton, showReviewDialog) => {
  chrome.storage.local.set(
    {
      watchlistUrl: url,
      showReviewButton: showReviewButton,
      showReviewDialog: showReviewDialog,
    },
    function () {}
  );
};
const watchlistUrl = document.getElementById("url");
const showReviewButton = document.getElementById("showReviewButton");
const showReviewDialog = document.getElementById("showReviewDialog");
const saveSettingsButton = document.getElementById("save");
const loadSettings = () => {
  chrome.storage.local.get(
    ["watchlistUrl", "showReviewButton", "showReviewDialog"],
    (data) => {
      watchlistUrl.value = data.watchlistUrl;
      showReviewButton.checked = data.showReviewButton;
      showReviewDialog.checked = data.showReviewDialog;
    }
  );
};
loadSettings();
saveSettingsButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const settings = {
    watchlistUrl: watchlistUrl.value,
    showReviewButton: showReviewButton.checked,
    showReviewDialog: showReviewDialog.checked,
  };
  if (await validateSettings(settings)) {
    saveSettings(
      watchlistUrl.value,
      showReviewButton.checked,
      showReviewDialog.checked
    );
    alert("保存しました");
  } else {
    alert("設定が正しくありません");
  }
});
