import prefetch from '../utils/prefetch';
import voidPromise from '../utils/void-promise';

export default function onIdle(el: HTMLAnchorElement): () => void {
  function callback() {
    voidPromise(prefetch(el.href));
  }
  const id = requestIdleCallback(callback);
  return () => cancelIdleCallback(id);
}
