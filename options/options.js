const getOrigin = (url) => {
  try {
    return new URL(url).origin + "/*";
  } catch (error) {
    return null;
  }
};
const requestPermission = async (url) => {
  return await chrome.permissions.request({
    origins: [getOrigin(url)],
  });
};
const listPermissions = async () => {
  return chrome.permissions.getAll();
};

const saveSettings = (url, showReviewButton, showReviewDialog) => {
  chrome.storage.local.set(
    {
      watchlistUrl: url,
      showReviewButton: showReviewButton,
      showReviewDialog: showReviewDialog,
    },
    function () {},
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
      watchlistUrl.value = data.watchlistUrl ?? "";
      showReviewButton.checked = data.showReviewButton;
      showReviewDialog.checked = data.showReviewDialog;
    },
  );
};
loadSettings();
saveSettingsButton.addEventListener("click", async (event) => {
  event.preventDefault();
  event.target.textContent = "保存中...";

  try {
    await requestPermission(watchlistUrl.value);
  } catch {
    alert("URLが正しくありません");
    event.target.textContent = "保存する";
    return;
  }

  const settings = {
    watchlistUrl: watchlistUrl.value,
    showReviewButton: showReviewButton.checked,
    showReviewDialog: showReviewDialog.checked,
  };
  if (await validateSettings(settings)) {
    saveSettings(
      watchlistUrl.value,
      showReviewButton.checked,
      showReviewDialog.checked,
    );
    alert("保存しました");
  } else {
    alert("設定が正しくありません");
  }
  event.target.textContent = "保存する";
});

const addUrlButton = document.getElementById("addUrlButton");
const urlInput = document.getElementById("urlInput");
const urlList = document.getElementById("urlList");

const loadPermissions = async () => {
  urlList.innerHTML = "";
  const permissions = await listPermissions();
  for (const permission of permissions.origins) {
    const li = document.createElement("li");
    li.textContent = permission;
    urlList.appendChild(li);
  }
};
loadPermissions();

addUrlButton.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    const url = new URL(urlInput.value);
  } catch {
    alert("URLが正しくありません");
    return;
  }
  const result = await requestPermission(urlInput.value);
  if (result) {
    urlInput.value = "";
  } else {
    alert("許可されませんでした");
  }
  loadPermissions();
});
