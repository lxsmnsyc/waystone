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
import { isLocalURL, isModifiedEvent } from './utils/routing';

const DISABLED = 'ws:disabled';
const SCROLL = 'ws:scroll';
const REPLACE = 'ws:replace';

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
  const cleanup = applyPrefetchStrategies(el);

  if (cleanup) {
    const unsubscribe = PAGE.on('unload', () => {
      cleanup();
      unsubscribe();
    });

    onRemove(el, () => {
      cleanup();
      unsubscribe();
    });
  }
}

function onClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) {
    return;
  }
  const el = event.target.closest('a');
  if (!(el instanceof HTMLAnchorElement)) {
    return;
  }
  if (el.target && el.target !== '_self') {
    return;
  }
  const targetHref = el.href;
  // Make sure that the click is native and
  // that the url is local
  if (isModifiedEvent(event) || !isLocalUrlAbsolute(targetHref)) {
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
  if (el.hasAttribute(DISABLED)) {
    return;
  }

  event.preventDefault();

  let scroll = el.getAttribute(SCROLL) ?? 'auto';
  if (scroll !== 'none' && targetHref.indexOf('#') > 0) {
    scroll = 'none';
  }
  // eslint-disable-next-line no-void
  void navigate(targetHref, {
    replace: el.getAttribute(REPLACE),
    scroll: scroll as ScrollBehavior,
  });
}

function onPopState() {
  void navigate(window.location.pathname, {
    pop: true,
    scroll: 'none',
  });
}

PAGE.on('load', () => {
  window.addEventListener('click', onClick);
  window.addEventListener('popstate', onPopState);

  PAGE.on('unload', () => {
    window.removeEventListener('click', onClick);
    window.removeEventListener('popstate', onPopState);
  });
});
