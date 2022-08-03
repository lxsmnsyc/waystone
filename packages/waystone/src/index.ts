import { onInsert, resetObserver } from './dom-lifecycle';
import { PAGE, PageLifecycleListener, PageLifecycleType } from './page-lifecycle';
import registerAnchor from './register-anchor';

export {
  PageLifecycleEvent,
  PageLifecycleListener,
  PageLifecycleType,
} from './page-lifecycle';
export {
  onInsert,
  onRemove,
} from './dom-lifecycle';

export function on(
  event: PageLifecycleType,
  callback: PageLifecycleListener,
): () => void {
  return PAGE.on(event, callback);
}

function load() {
  resetObserver();

  document.body.querySelectorAll('a').forEach((item) => {
    registerAnchor(item);
  });

  onInsert((item) => {
    if (item instanceof HTMLAnchorElement) {
      registerAnchor(item);
    }
  });
}

PAGE.on('load', load);

window.addEventListener('DOMContentLoaded', () => {
  PAGE.notify('load');
});
