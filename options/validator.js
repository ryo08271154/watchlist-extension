const validateWatchlistUrl = async (url) => {
  // URLが正しいか検証
  if (!url || !url.startsWith("http://")) {
    return false;
  }
  try {
    const response = await fetch(`${url}/extension`);
    const text = await response.text();
    return text.includes(`拡張機能の設定から視聴記録のURLを ${url} にします`);
  } catch {
    return false;
  }
  return false;
};
const validateSettings = async (settings = null) => {
  if (!settings) {
    settings = await new Promise((resolve) => {
      chrome.storage.local.get(
        ["watchlistUrl", "showReviewButton", "showReviewDialog"],
        (data) => {
          resolve(data);
        }
      );
    });
  }
  return await validateWatchlistUrl(settings.watchlistUrl);
};
