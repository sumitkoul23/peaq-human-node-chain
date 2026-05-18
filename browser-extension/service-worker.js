chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ running: false, heartbeats: 0, rewards: 0 });
});
