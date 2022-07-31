import prefetch from '../utils/prefetch';
import voidPromise from '../utils/void-promise';

export default function onDelay(
  el: HTMLAnchorElement,
  timeout: number,
): () => void {
  function callback() {
    voidPromise(prefetch(el.href));
  }
  const id = setTimeout(callback, timeout);
  return () => clearTimeout(id);
}
