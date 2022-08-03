import prefetch from '../utils/prefetch';

export default function onLoad(el: HTMLAnchorElement): () => void {
  function callback() {
    void prefetch(el.href);
  }
  window.addEventListener('load', callback, {
    once: true,
  });
  return () => window.removeEventListener('load', callback);
}
