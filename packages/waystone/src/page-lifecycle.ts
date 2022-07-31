/* eslint-disable max-classes-per-file */
export type PageLifecycleType = 'beforeunload' | 'unload' | 'load';

export class PageLifecycleEvent extends Event {
}

export type PageLifecycleListener = (ev: PageLifecycleEvent) => void;

export class PageLifecycle {
  private listeners = new Map<PageLifecycleType, Set<PageLifecycleListener>>();

  on(event: PageLifecycleType, callback: PageLifecycleListener): () => void {
    let listeners = this.listeners.get(event);

    if (!listeners) {
      listeners = new Set();
      this.listeners.set(event, listeners);
    }

    listeners.add(callback);

    return () => {
      listeners?.delete(callback);
    };
  }

  notify(event: PageLifecycleType): boolean {
    const listeners = this.listeners.get(event);

    const instance = new PageLifecycleEvent(event);

    if (listeners) {
      for (const listener of listeners.keys()) {
        listener(instance);
      }
    }

    return instance.defaultPrevented;
  }
}

export const PAGE = new PageLifecycle();
