import prefetch from '../utils/prefetch';

export default function onMedia(
  el: HTMLAnchorElement,
  query: string,
): (() => void) | undefined {
  const media = window.matchMedia(query);

  function callback() {
    void prefetch(el.href);
  }

  const onMediaCallback = () => {
    if (media.matches) {
      callback();
      media.removeEventListener('change', onMediaCallback);
    }
  };

  if (media.matches) {
    callback();
    return undefined;
  }
  media.addEventListener('change', onMediaCallback);
  return () => media.removeEventListener('change', onMediaCallback);
}
