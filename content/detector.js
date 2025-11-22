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

const getTitle = async () => {
  const pageTitle = document.title;
  const hostname = location.hostname;
  const siteName = hostname.replace(/www\./i, "").split(".")[0];

  const words = pageTitle
    .normalize("NFKC")
    .replace(/[,\.~!@#\$%\^&\*_\+\-=\{\}\[\]:;"'<>?\\\/\|]/g, " ")
    .replace(/\s+/g, " ")
    .split(/[ 　\|｜{}【】（）()*~・「」『』《》<>]/)
    .filter((word) => word !== "");
  if (pageTitle.length <= 10) {
    return null;
  }
  for (const word of words) {
    if (word.includes(siteName) || ["Page", "Warmup"].includes(word)) {
      continue;
    }
    if (word.length <= 3) {
      continue;
    }
    const results = await watchlistSearch(word, { type: "title" });
    if (results[0].length === 0 || results[0].length > 5) {
      continue;
    }
    titleInfo = results[0][0];
    return titleInfo;
  }
  return null;
};
const getEpisode = async (titleId) => {
  const episodes = await getTitleEpisode(titleId);
  const pageTitle = document.title;
  const pageTitleEpisode = pageTitle.match(
    /(Episode|エピソード|#)(\d+)|(\d+)(話)/i
  );
  if (pageTitleEpisode && (pageTitleEpisode[2] || pageTitleEpisode[3])) {
    const episodeNumber = Number(pageTitleEpisode[2] || pageTitleEpisode[3]);
    const foundEpisode = episodes.find(
      (episode) => episode.number === episodeNumber
    );
    if (foundEpisode) {
      episodeInfo = foundEpisode;
      return foundEpisode;
    }
  }
  for (const episode of episodes) {
    if (episode.name && pageTitle.includes(episode.name)) {
      episodeInfo = episode;
      return episodeInfo;
    }
  }
  return null;
};
const resetInfo = () => {
  titleInfo = { id: null, name: null, description: null, url: null };
  episodeInfo = {
    id: null,
    name: null,
    number: null,
    airDate: null,
    url: null,
  };
  chrome.runtime.sendMessage({ action: "clearMessages" }, () => {});
};
