/**
 * Listen to all URL changes in SPA + browser navigation.
 * Covers: popstate, hashchange, history.pushState, history.replaceState
 *
 * @param {(info: { url: string, oldUrl: string, trigger: 'load'|'popstate'|'hashchange'|'pushState'|'replaceState' }) => void} callback
 * @param {{ fireOnInit?: boolean }} options
 * @returns {() => void} unsubscribe function
 */
export function onUrlChange (callback, options = {}) {
  const { fireOnInit = true } = options;

  let currentUrl = location.href;
  const listeners = [];

  const notify = (trigger) => {
    const newUrl = location.href;
    if (newUrl === currentUrl && trigger !== "load") return;

    const oldUrl = currentUrl;
    currentUrl = newUrl;

    const info = {
      url: newUrl,
      oldUrl,
      trigger,
    };
    callback(info);
  };

  // Window events
  const onPopState = () => notify("popstate");
  const onHashChange = () => notify("hashchange");

  window.addEventListener("popstate", onPopState);
  window.addEventListener("hashchange", onHashChange);

  listeners.push(() => window.removeEventListener("popstate", onPopState));
  listeners.push(() => window.removeEventListener("hashchange", onHashChange));

  // Patch history methods once globally
  if (!history.__urlChangePatched__) {
    history.__urlChangePatched__ = true;
    history.__urlChangeSubscribers__ = new Set();

    const rawPushState = history.pushState;
    const rawReplaceState = history.replaceState;

    history.pushState = function (...args) {
      const ret = rawPushState.apply(this, args);
      history.__urlChangeSubscribers__.forEach((fn) => fn("pushState"));
      return ret;
    };

    history.replaceState = function (...args) {
      const ret = rawReplaceState.apply(this, args);
      history.__urlChangeSubscribers__.forEach((fn) => fn("replaceState"));
      return ret;
    };
  }

  const historySubscriber = (trigger) => notify(trigger);
  history.__urlChangeSubscribers__.add(historySubscriber);
  listeners.push(() => history.__urlChangeSubscribers__.delete(historySubscriber));

  if (fireOnInit) {
    const info = {
      url: currentUrl,
      oldUrl: currentUrl,
      trigger: "load",
    };
    callback(info);
  }

  // unsubscribe
  return () => {
    listeners.forEach((off) => off());
  };
}
