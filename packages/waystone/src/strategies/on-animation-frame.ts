import prefetch from '../utils/prefetch';

export default function onAnimationFrame(el: HTMLAnchorElement): () => void {
  function callback() {
    void prefetch(el.href);
  }
  const id = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(id);
}
