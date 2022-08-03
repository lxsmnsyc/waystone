export function getLocationOrigin(): string {
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}

export function isLocalURL(url: string): boolean {
  // prevent a hydration mismatch on href for url with anchor refs
  if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
    return true;
  }
  try {
    // absolute urls can be local if they are on the same origin
    const locationOrigin = getLocationOrigin();
    const resolved = new URL(url, locationOrigin);
    return resolved.origin === locationOrigin;
  } catch (_) {
    return false;
  }
}

export function isModifiedEvent(event: MouseEvent): boolean {
  return (
    event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey // triggers resource download
  );
}
