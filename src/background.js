chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) {
    return;
  }

  const isChatGptTab =
    typeof tab.url === "string" && tab.url.startsWith("https://chatgpt.com/");

  if (!isChatGptTab) {
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: "toggle-ui" }, () => {
    void chrome.runtime.lastError;
  });
});
