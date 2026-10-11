// One subscription for settings, progress and study tools, including other tabs.
const listeners = new Set();
let revision = 0;

export function subscribeStore(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStoreRevision() {
  return revision;
}

export function notifyStore() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (!event.key || event.key === "mathfoundry_data") notifyStore();
  });
}
