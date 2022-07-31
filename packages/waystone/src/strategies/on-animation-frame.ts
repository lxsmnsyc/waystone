import prefetch from '../utils/prefetch';
import voidPromise from '../utils/void-promise';

export default function onAnimationFrame(el: HTMLAnchorElement): () => void {
  function callback() {
    voidPromise(prefetch(el.href));
  }
  const id = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(id);
}
