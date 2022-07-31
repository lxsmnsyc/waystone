import prefetch from '../utils/prefetch';
import voidPromise from '../utils/void-promise';

export default function onLoad(el: HTMLAnchorElement): () => void {
  function callback() {
    voidPromise(prefetch(el.href));
  }
  const currentWindow = document.defaultView ?? window;
  currentWindow.addEventListener('load', callback, {
    once: true,
  });
  return () => currentWindow.removeEventListener('load', callback);
}
