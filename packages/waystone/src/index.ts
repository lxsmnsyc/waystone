import { onInsert, resetObserver } from './dom-lifecycle';
import { notify, on } from './page-lifecycle';
import { registerAnchor, setupEvents } from './register-anchor';

export {
  PageLifecycleEvent,
  PageLifecycleListener,
  PageLifecycleType,
  on,
} from './page-lifecycle';
export {
  onInsert,
  onRemove,
} from './dom-lifecycle';

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

setupEvents();

on('load', load);

// Defer on DOMContentLoad
window.addEventListener('DOMContentLoaded', () => {
  notify('load');
});
