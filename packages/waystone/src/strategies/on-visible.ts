import prefetch from '../utils/prefetch';
import voidPromise from '../utils/void-promise';

export default function onVisible(
  el: HTMLAnchorElement,
): () => void {
  const observer = new IntersectionObserver((entries) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of entries) {
      if ((entry.isIntersecting || entry.intersectionRatio > 0)) {
        voidPromise(prefetch(el.href));
        observer.disconnect();
        break;
      }
    }
  });

  observer.observe(el);

  return () => observer.disconnect();
}
