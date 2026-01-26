chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "watchlistSearch") {
    watchlistSearch(message.query, message.params).then((results) => {
      sendResponse({ results: results });
    });
  } else if (message.action === "getTitle") {
    if (titleInfo?.id) {
      sendResponse({ title: titleInfo });
    } else {
      getTitle().then((title) => {
        sendResponse({ title: title });
      });
    }
  } else if (message.action === "getEpisode") {
    if (episodeInfo?.id) {
      sendResponse({ episode: episodeInfo });
    } else {
      (async () => {
        let episode = await getEpisode(message.titleId);
        if (!episode) {
          episode = await getEpisodeFromCandidates();
        }
        sendResponse({ episode: episode });
      })();
    }
  }
  return true;
});

const removeWatchlistReview = () => {
  const button = document.getElementById("watchlistReviewButton");
  const dialog = document.getElementById("watchlistReviewDialog");
  if (button) {
    button.remove();
  }
  if (dialog) {
    dialog.remove();
  }
};

async function getInfo() {
  await sleep(1000);
  await getTitle();
  if (titleInfo?.id) {
    let episode = await getEpisode(titleInfo.id);
    if (!episode) {
      episode = await getEpisodeFromCandidates();
    }
    if (episode?.id) {
      chrome.storage.local.get(
        ["showReviewButton", "showReviewDialog"],
        (data) => {
          removeWatchlistReview();
          if (data.showReviewButton) {
            addButton(episodeInfo);
          }
          if (data.showReviewDialog) {
            addDialog(titleInfo, episodeInfo);
          }
        },
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
    removeWatchlistReview();
    resetInfo();
    getInfo();
  }
}).observe(document.body, { childList: true, subtree: true });
