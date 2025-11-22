const getWatchlistUrl = async () => {
  const watchlistUrl = await new Promise((resolve) => {
    chrome.storage.local.get("watchlistUrl", (data) => {
      resolve(data.watchlistUrl ?? "".replace(/\/$/, ""));
    });
  });
  if (!watchlistUrl) {
    addMessage(
      "error",
      "視聴記録のURLが設定されていません。オプション画面で設定してください。"
    );
    throw new Error("Watchlist URL is not set");
  }
  return watchlistUrl;
};

const messages = [];
const getMessages = () => {
  return messages;
};
const addMessage = (type, message) => {
  if (messages.some((msg) => msg.type === type && msg.message === message)) {
    return;
  }
  messages.push({ type: type, message: message });
};
const clearMessages = () => {
  messages.length = 0;
};
const checkLoginStatus = (response) => {
  if (response.url.includes("/login")) {
    addMessage(
      "error",
      "視聴記録にログインされていません。視聴記録にログインしてください。"
    );
    throw new Error("Not logged in to Watchlist");
  }
};
const fetchWatchlistSearch = async (query, params) => {
  try {
    const watchlistUrl = await getWatchlistUrl();
    const parameter = new URLSearchParams(params).toString();
    const response = await fetch(
      `${watchlistUrl}/search?q=${query}&${parameter}`
    );
    const html = await response.text();
    checkLoginStatus(response);
    return html;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      addMessage(
        "error",
        "視聴記録に接続できません。ネットワーク接続と拡張機能のサイトへのアクセスが許可されていることを確認してください。"
      );
    } else {
      addMessage("error", "視聴記録の検索中にエラーが発生しました。");
    }
    console.log("Error in watchlistSearch:", error);

    return null;
  }
};
const fetchTitleEpisode = async (titleId) => {
  try {
    const watchlistUrl = await getWatchlistUrl();
    const response = await fetch(`${watchlistUrl}/title/${titleId}/episodes`);
    const html = await response.text();
    checkLoginStatus(response);
    return html;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      addMessage(
        "error",
        "視聴記録に接続できません。ネットワーク接続と拡張機能のサイトへのアクセスが許可されていることを確認してください。"
      );
    } else {
      addMessage("error", "エピソード情報の取得中にエラーが発生しました。");
    }
    console.log("Error in fetchTitleEpisode:", error);
    return null;
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  if (message.action === "fetchWatchlistSearch") {
    (async () => {
      const html = await fetchWatchlistSearch(message.query, message.params);
      sendResponse({ html: html });
    })();
  } else if (message.action === "fetchTitleEpisode") {
    (async () => {
      const html = await fetchTitleEpisode(message.titleId);
      sendResponse({ html: html });
    })();
  } else if (message.action === "getMessages") {
    sendResponse({ messages: getMessages() });
  } else if (message.action === "addMessage") {
    addMessage(message.type, message.message);
    sendResponse({ success: true });
  } else if (message.action === "clearMessages") {
    clearMessages();
    sendResponse({ success: true });
  }
  return true;
});
const checkUpdate = async () => {
  try {
    const watchlistUrl = await getWatchlistUrl();
    const response = await fetch(`${watchlistUrl}/extension`);
    const data = await response.text();
    const urls = data.match(/https?:\/\/[^\s"'<>]+/g);
    if (!urls) return;
    const targetUrl = urls.find((url) =>
      url.includes(
        "https://api.github.com/repos/ryo08271154/watchlist-extension/zipball/"
      )
    );
    if (!targetUrl) return;
    const match = targetUrl.match(/\/(v[\d.]+)$/);
    if (!match) return;
    const latestVersion = match[1].replace("v", "");
    const currentVersion = chrome.runtime.getManifest().version;
    if (latestVersion !== currentVersion) {
      addMessage(
        "warning",
        `新しいバージョンが利用可能です: ${latestVersion} (現在のバージョン: ${currentVersion} ${watchlistUrl}/extension からダウンロードしてください。`
      );
    }
  } catch (error) {
    console.log("Error in checkUpdate:", error);
  }
};
chrome.management.getSelf((info) => {
  console.log(info);
  if (info.installType === "development") {
    console.log("Checking for updates...");
    checkUpdate();
  }
});
