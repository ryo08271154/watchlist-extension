const titleName = document.getElementById("titleName");
const titleDescription = document.getElementById("titleDescription");
const episodeName = document.getElementById("episodeName");
const episodeDescription = document.getElementById("episodeDescription");
const episodeDate = document.getElementById("episodeDate");
const episodeNumber = document.getElementById("episodeNumber");
const titleContainer = document.getElementById("titleContainer");
const episodeContainer = document.getElementById("episodeContainer");
const buttonContainer = document.getElementById("buttonContainer");
const titleDetail = document.getElementById("titleDetail");
const episodeDetail = document.getElementById("episodeDetail");
const episodeListButton = document.getElementById("episodeListButton");
const reviewButton = document.getElementById("reviewButton");
const episodeReviewButton = document.getElementById("episodeReviewButton");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResult = document.getElementById("searchResult");
let titleInfo = {
  id: null,
  name: null,
  description: null,
  url: null,
};
let episodeInfo = {
  id: null,
  name: null,
  number: null,
  airDate: null,
  url: null,
};
const getActiveTabId = () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].id);
    });
  });
};
const getMessages = () => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "getMessages" }, (data) => {
      resolve(data.messages);
    });
  });
};
const loadMessages = async () => {
  const messages = await getMessages();
  if (messages.some((msg) => msg.type === "error")) {
    searchInput.style.display = "none";
    searchButton.style.display = "none";
  }
  for (const message of messages) {
    addMessage(message.type, message.message);
  }
};
const addMessage = (type, message) => {
  const messages = document.getElementById("messages");
  messages.style.display = "block";
  const li = document.createElement("li");
  li.classList.add(type);
  li.textContent = message;
  messages.appendChild(li);
};
async function loadInitialData() {
  chrome.storage.local.get("watchlistUrl", (data) => {
    if (!data.watchlistUrl || !data.watchlistUrl.startsWith("http://")) {
      searchInput.style.display = "none";
      searchButton.style.display = "none";
      addMessage(
        "error",
        "設定がされていません。オプション画面で設定をしてください。"
      );
      const result = confirm(
        "設定がされていません。オプション画面を開きますか？"
      );
      if (result) {
        chrome.runtime.openOptionsPage();
      }
      return;
    }
  });
  await loadMessages();

  const tabId = await getActiveTabId();
  const data = await new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: "getTitle" }, (data) => {
      resolve(data);
    });
  });
  if (data?.title?.id) {
    titleContainer.style.display = "block";
    titleName.textContent = data?.title.name ?? "";
    titleDescription.textContent = data?.title.description ?? "";
    titleDetail.href = data?.title.url;
    titleInfo = data?.title;
  }
  if (titleInfo.id) {
    buttonContainer.style.display = "block";
    chrome.tabs.sendMessage(
      tabId,
      { action: "getEpisode", titleId: titleInfo.id },
      (data) => {
        if (data?.episode) {
          episodeReviewButton.style.display = "inline-block";
          episodeContainer.style.display = "block";
          episodeName.textContent = data?.episode.name ?? "";
          episodeDate.textContent = data?.episode.airDate ?? "";
          episodeNumber.textContent = "エピソード" + data?.episode.number ?? "";
          episodeDetail.href = data?.episode.url;
          episodeInfo = data?.episode;
        }
      }
    );
  }
}
loadInitialData();
const watchlistSearch = async (query, params) => {
  const tabId = await getActiveTabId();
  results = await new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tabId,
      { action: "watchlistSearch", query: query, params: params },
      (data) => {
        resolve(data?.results ?? []);
      }
    );
  });
  await loadMessages();
  return results;
};
// ボタン押下時の処理
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchButton.click();
  }
});
searchInput.addEventListener("input", () => {
  searchResult.style.display = "none";
});
searchButton.addEventListener("click", async () => {
  const query = searchInput.value;
  const results = await watchlistSearch(query);
  searchResult.style.display = "block";
  searchResult.innerHTML = "";
  for (const result of results) {
    for (const item of result) {
      const link = document.createElement("a");
      link.classList.add("search-result-item");
      console.log(item);
      link.target = "_blank";
      link.href = item.url;
      link.textContent = item.name;
      if (item.description) link.textContent += ` - ${item.description}`;
      searchResult.appendChild(link);
    }
    searchResult.appendChild(document.createElement("hr"));
  }
});
episodeListButton.addEventListener("click", async () => {
  chrome.tabs.create({ url: titleInfo.url + "/episodes" });
});
reviewButton.addEventListener("click", async () => {
  const reviewPage = titleInfo.url + "/review";
  chrome.tabs.create({ url: reviewPage });
});
episodeReviewButton.addEventListener("click", async () => {
  const episodeReviewPage = episodeInfo.url + "/review";
  chrome.tabs.create({ url: episodeReviewPage });
});
