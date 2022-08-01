import morphdom from 'morphdom';
import { onRemove } from './dom-lifecycle';
import { PAGE } from './page-lifecycle';
import onAnimationFrame from './strategies/on-animation-frame';
import onDelay from './strategies/on-delay';
import onIdle from './strategies/on-idle';
import onInteraction from './strategies/on-interaction';
import onLoad from './strategies/on-load';
import onMedia from './strategies/on-media';
import onReadyState from './strategies/on-ready-state';
import onVisible from './strategies/on-visible';
import isAnchorDisabled from './utils/is-anchor-disabled';
import { isLocalURL, isModifiedEvent } from './utils/routing';
import voidPromise from './utils/void-promise';

interface NavigateOptions {
  pop?: boolean;
  replace?: string | null;
  scroll: ScrollBehavior | 'none';
}

async function navigate(href: string, options: NavigateOptions) {
  if (PAGE.notify('beforeunload')) {
    return;
  }
  PAGE.notify('unload');
  const response = await fetch(href);
  const result = await response.text();
  if (document.documentElement.hasAttribute('ws:diff')) {
    const tree = new DOMParser().parseFromString(result, 'text/html');
    morphdom(document.documentElement, tree.documentElement, {
      onBeforeElUpdated(fromEl, toEl) {
        return !fromEl.isEqualNode(toEl);
      },
    });
  } else {
    // Replace document
    document.open();
    document.write(result);
    document.close();
  }
  // Update history
  if (!options.pop) {
    if (options.replace != null) {
      window.history.replaceState(null, '', href);
    } else {
      window.history.pushState(null, '', href);
    }
  }
  if (options.scroll !== 'none') {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: options.scroll,
    });
  }
  PAGE.notify('load');
}

export function registerPopState() {
  const currentWindow = document.defaultView;

  function onPopState() {
    voidPromise(navigate(document.location.pathname, {
      pop: true,
      scroll: 'none',
    }));
  }

  if (currentWindow) {
    currentWindow.addEventListener('popstate', onPopState);

    const cleanup = PAGE.on('unload', () => {
      currentWindow.removeEventListener('popstate', onPopState);
      cleanup();
    });
  }
}

function isLocalUrlAbsolute(url: string): boolean {
  return isLocalURL(url) && !url.startsWith('#');
}

function applyPrefetchStrategies(el: HTMLAnchorElement): (() => void) | undefined {
  const visible = el.hasAttribute('ws:visible');
  if (visible) {
    return onVisible(el);
  }
  const readyState = el.getAttribute('ws:ready-state');
  if (readyState) {
    return onReadyState(el, readyState as DocumentReadyState);
  }
  const mediaQuery = el.getAttribute('ws:media');
  if (mediaQuery) {
    return onMedia(el, mediaQuery);
  }
  const load = el.hasAttribute('ws:load');
  if (load) {
    return onLoad(el);
  }
  const interaction = el.hasAttribute('ws:interaction');
  if (interaction) {
    return onInteraction(el);
  }
  const idle = el.hasAttribute('ws:idle');
  if (idle) {
    return onIdle(el);
  }
  const delay = el.getAttribute('ws:delay');
  if (delay) {
    return onDelay(el, Number(delay));
  }
  const animationFrame = el.hasAttribute('ws:animation-frame');
  if (animationFrame) {
    return onAnimationFrame(el);
  }
  return undefined;
}

export default function registerAnchor(
  el: HTMLAnchorElement,
) {
  function onClick(ev: MouseEvent) {
    const targetHref = el.href;
    // Make sure that the click is native and
    // that the url is local
    if (isModifiedEvent(ev) || !isLocalUrlAbsolute(targetHref)) {
      return;
    }
    // Check if the element has a download attribute
    if (el.hasAttribute('download')) {
      return;
    }
    // Check if the element has rel="external"
    if (el.getAttribute('rel')?.includes('external')) {
      return;
    }
    // Check if the element has disabled routing
    if (isAnchorDisabled(el)) {
      return;
    }

    ev.preventDefault();

    let scroll = el.getAttribute('ws:scroll') ?? 'auto';
    if (targetHref.indexOf('#') > 0) {
      scroll = 'none';
    }
    voidPromise(navigate(targetHref, {
      replace: el.getAttribute('ws:replace'),
      scroll: scroll as ScrollBehavior,
    }));
  }

  const cleanup = applyPrefetchStrategies(el);

  function clean() {
    el.removeEventListener('click', onClick);
    cleanup?.();
  }

  el.addEventListener('click', onClick);

  const unsubscribe = PAGE.on('unload', () => {
    clean();
    unsubscribe();
  });

  onRemove(el, () => {
    clean();
    unsubscribe();
  });
}
