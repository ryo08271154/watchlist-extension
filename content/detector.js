let titleInfo = {
  id: null,
  name: null,
  description: null,
  url: null,
};
let searchCandidates = [];
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
  const excludedWords = [
    "ビデオ",
    "TV",
    "テレビ",
    "映画",
    "番組",
    "アニメ",
    "漫画",
    "漫画",
    "ゲーム",
    "音楽",
    "書籍",
    "本",
    "作品",
    "無料",
    "人気",
    "No",
    "動画",
    "配信",
    "最新話",
    "公式",
    "あらすじ",
    "感想",
    "まとめ",
    "サイト",
    "ページ",
    "円",
    "レビュー",
    "字幕",
    "吹き替え",
    "見放題",
    "検索",
    "おすすめ",
    "独占",
    "ランキング",
    "履歴",
    "購入",
    "マイリスト",
    "マイページ",
    "設定",
    "アカウント",
    "ログイン",
    "ログアウト",
    "詳細",
    "情報",
    "お知らせ",
    "DM",
    "ニュース",
    "メッセージ",
  ];
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
    if (excludedWords.some((ex) => word.includes(ex))) {
      continue;
    }
    if (word.length <= 3) {
      continue;
    }

    let results = await watchlistSearch(word, { type: "title,episode" });
    let titles = results[0];
    let episodes = results[1];

    // タイトル名が含まれていないときエピソードからタイトルを特定する
    if (episodes.length === 1) {
      results = await watchlistSearch(results[1][0].description, {
        type: "title",
      });
      titles = results[0];
      episodes = results[1];
    }

    if (titles.length === 0) {
      continue;
    }
    if (titles.length <= 8) {
      titleInfo = results[0][0];
      searchCandidates = results[0];
      searchCandidates.shift(); // 最初の要素は確定したタイトルなので除外
      return titleInfo;
    }
  }
  return null;
};
const getEpisodeFromCandidates = async () => {
  for (const candidate of searchCandidates) {
    const episode = await getEpisode(candidate.id);
    if (episode) {
      titleInfo = candidate;
      return episode;
    }
  }
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
