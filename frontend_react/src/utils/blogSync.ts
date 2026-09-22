const BLOG_SYNC_KEY = "pet-corner:blog-updated";

export const notifyBlogUpdated = () => {
  const timestamp = Date.now().toString();
  localStorage.setItem(BLOG_SYNC_KEY, timestamp);
  window.dispatchEvent(new CustomEvent("blog-updated", { detail: { timestamp } }));
};

export const listenToBlogUpdates = (callback: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === BLOG_SYNC_KEY) {
      callback();
    }
  };

  const handleCustomEvent = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener("blog-updated", handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("blog-updated", handleCustomEvent);
  };
};
