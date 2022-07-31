import { PAGE, PageLifecycleListener, PageLifecycleType } from './page-lifecycle';
import registerAnchor, { registerPopState } from './register-anchor';

export {
  PageLifecycleEvent,
  PageLifecycleListener,
  PageLifecycleType,
} from './page-lifecycle';

export function on(
  event: PageLifecycleType,
  callback: PageLifecycleListener,
): () => void {
  return PAGE.on(event, callback);
}

function load(currentBody: HTMLElement) {
  currentBody.querySelectorAll('a').forEach((item) => {
    registerAnchor(item);
  });

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'childList') {
        // eslint-disable-next-line no-loop-func
        record.addedNodes.forEach((item) => {
          if (item instanceof HTMLAnchorElement) {
            registerAnchor(item);
          }
        });
      }
    }
  });

  registerPopState(currentBody);

  const cleanup = PAGE.on('unload', () => {
    observer.disconnect();
    cleanup();
  });

  observer.observe(currentBody, { childList: true, subtree: true });
}

PAGE.on('load', () => {
  load(document.documentElement);
});

load(document.documentElement);
