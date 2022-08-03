import prefetch from '../utils/prefetch';

export default function onDelay(
  el: HTMLAnchorElement,
  timeout: number,
): () => void {
  function callback() {
    void prefetch(el.href);
  }
  const id = setTimeout(callback, timeout);
  return () => clearTimeout(id);
}
