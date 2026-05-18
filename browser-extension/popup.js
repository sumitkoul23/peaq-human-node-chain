const statusEl = document.getElementById("status");
const heartbeatsEl = document.getElementById("heartbeats");
const rewardsEl = document.getElementById("rewards");

async function readState() {
  const state = await chrome.storage.local.get(["running", "heartbeats", "rewards"]);
  statusEl.textContent = state.running ? "running" : "offline";
  heartbeatsEl.textContent = state.heartbeats || 0;
  rewardsEl.textContent = `${state.rewards || 0} PHN`;
}

document.getElementById("start").onclick = async () => {
  await chrome.storage.local.set({ running: true });
  readState();
};
document.getElementById("heartbeat").onclick = async () => {
  const state = await chrome.storage.local.get(["running", "heartbeats", "rewards"]);
  if (!state.running) return;
  await chrome.storage.local.set({
    heartbeats: (state.heartbeats || 0) + 1,
    rewards: (state.rewards || 0) + 1
  });
  readState();
};
document.getElementById("claim").onclick = async () => {
  await chrome.storage.local.set({ rewards: 0 });
  readState();
};
readState();
