import prefetch from '../utils/prefetch';

export default function onIdle(el: HTMLAnchorElement): () => void {
  function callback() {
    void prefetch(el.href);
  }
  const id = requestIdleCallback(callback);
  return () => cancelIdleCallback(id);
}
