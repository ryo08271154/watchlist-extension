chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "watchlistSearch") {
    watchlistSearch(message.query, message.params).then((results) => {
      sendResponse({ results: results });
    });
  } else if (message.action === "getTitle") {
    if (titleInfo.name && document.title.includes(titleInfo.name.slice(0, 6))) {
      sendResponse({ title: titleInfo });
      return true;
    }
    getTitle().then((title) => {
      sendResponse({ title: title });
    });
  } else if (message.action === "getEpisode") {
    if (
      (episodeInfo.name &&
        document.title.includes(episodeInfo.name.slice(0, 6))) ||
      (episodeInfo.number && document.title.includes(episodeInfo.number))
    ) {
      sendResponse({ episode: episodeInfo });
      return true;
    }
    getEpisode(message.titleId).then((episode) => {
      sendResponse({ episode: episode });
    });
  }
  return true;
});

async function getInfo() {
  const button = document.getElementById("watchlistReviewButton");
  const dialog = document.getElementById("watchlistReviewDialog");
  if (button) {
    button.remove();
  }
  if (dialog) {
    dialog.remove();
  }
  resetInfo();
  await sleep(1000);
  await getTitle();
  if (titleInfo.id) {
    await getEpisode(titleInfo.id);
    if (episodeInfo.id) {
      chrome.storage.local.get(
        ["showReviewButton", "showReviewDialog"],
        (data) => {
          if (data.showReviewButton) {
            addButton(episodeInfo);
          }
          if (data.showReviewDialog) {
            addDialog(titleInfo, episodeInfo);
          }
        }
      );
      attachVideoListeners();
    }
  }
}
window.addEventListener("load", getInfo);
window.addEventListener("popstate", getInfo);
window.addEventListener("hashchange", getInfo);
let lastUrl = location.href;
new MutationObserver(() => {
  if (lastUrl !== location.href) {
    lastUrl = location.href;
    getInfo();
  }
}).observe(document.body, { childList: true, subtree: true });
