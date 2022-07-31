import prefetch from '../utils/prefetch';
import voidPromise from '../utils/void-promise';

const DEFAULT_EVENTS = ['mouseenter', 'focusin', 'touchstart'];

export default function onInteraction(
  el: HTMLAnchorElement,
): () => void {
  function run() {
    voidPromise(prefetch(el.href));
    for (const event of DEFAULT_EVENTS) {
      el.removeEventListener(event, run, {
        capture: true,
      });
    }
  }

  for (const event of DEFAULT_EVENTS) {
    el.addEventListener(event, run, {
      capture: true,
    });
  }

  return () => {
    for (const event of DEFAULT_EVENTS) {
      el.removeEventListener(event, run, {
        capture: true,
      });
    }
  };
}
