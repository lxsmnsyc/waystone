import prefetch from '../utils/prefetch';
import voidPromise from '../utils/void-promise';

export default function onLoad(el: HTMLAnchorElement): () => void {
  function callback() {
    voidPromise(prefetch(el.href));
  }
  window.addEventListener('load', callback, {
    once: true,
  });
  return () => window.removeEventListener('load', callback);
}
