const getWatchlistUrl = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get("watchlistUrl", (data) => {
      resolve(data.watchlistUrl.replace(/\/$/, ""));
    });
  });
};
const watchlistSearch = async (query, params = {}) => {
  const html = await new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: "fetchWatchlistSearch", query: query, params: params },
      (data) => {
        resolve(data.html);
      }
    );
  });
  const watchlistUrl = await getWatchlistUrl();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const searchResult = doc.getElementsByClassName("title-container");
  const results = [];
  for (let i = 0; i < searchResult.length; i++) {
    const items = searchResult[i].getElementsByTagName("a");
    results[i] = [];
    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      results[i].push({
        id: item.getAttribute("href").split("/").pop(),
        name: item.querySelector("h3").textContent,
        description: item.querySelector("p").textContent,
        url: new URL(item.getAttribute("href"), watchlistUrl).href,
      });
    }
  }
  return results;
};
const getTitleEpisode = async (titleId) => {
  const html = await new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: "fetchTitleEpisode", titleId: titleId },
      (data) => {
        resolve(data.html);
      }
    );
  });
  const watchlistUrl = await getWatchlistUrl();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const container = doc.querySelector(".title-container");
  const episodeElements = container.getElementsByClassName("title-item");
  const episodes = [];
  for (const episode of episodeElements) {
    episodes.push({
      id: episode.getAttribute("href").split("/").pop(),
      name: episode.querySelector(".episode-item").querySelector("h3")
        .textContent,
      number: Number(
        episode.getElementsByTagName("h3")[1].textContent.match(/\d+/)[0]
      ),
      airDate: episode.querySelector("p").textContent,
      url: new URL(episode.getAttribute("href"), watchlistUrl).href,
    });
  }
  return episodes;
};
