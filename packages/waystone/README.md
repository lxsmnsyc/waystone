# waystone

> MPAs that feels like SPA

[![NPM](https://img.shields.io/npm/v/waystone.svg)](https://www.npmjs.com/package/waystone) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
## Install

```bash
npm i waystone
```

```bash
yarn add waystone
```

```bash
pnpm add waystone
```

## Usage

```js
import 'waystone';
```

**NOTE**: Waystone is required to only run once, so it's ideal to serve it on JS files where the module is going to be instanciated once.

### Replace instead of Push

You can use `ws:replace` to replace the History state rather than push when navigating

```html
<a href="/my-page" ws:replace>My page</a>
```

### Scroll control

By default, anchor tags will scroll up instantly to the top of the page when navigated to. You can add `ws:scroll="none"` to preserve scroll or you can use `ws:scroll="smooth"` if you want the page to scroll up smoothly.

### Prefetch strategies

You can add one of the following attributes to your anchor tags prefetch strategies:

- `ws:animation-frame`: Prefetches through `requestAnimationFrame`
- `ws:delay="1000"`: Prefetches through `setTimeout`
- `ws:idle`: Prefetches through `requestIdleCallback`
- `ws:interaction`: Prefetches when the element receives focus, is hovered or about to be touched.
- `ws:load`: Prefetches after the current window has loaded.
- `ws:media="(orientation: portrait)"`: Prefetches using media query
- `ws:ready-state="interactive"`: Prefetches using `document.readyState`
- `ws:visible`: Prefetches when the element is visible in the viewport

### Opting-out

You can add `ws:disabled` to your anchor element.

```html
<a href="/my-page" ws:disabled>My Page</a>
```

### Lifecycle Events

Waystone provides lifecycle events through `on`.

```js
import { on } from 'waystone';

on('unload', () => {
  cleanupStuff();
});
```

Waystone lifecycle involves three steps:

- `beforeunload`: This is called before `unload` happens. In this event, you can cancel the navigation by calling `event.preventDefault()`

```js
on('beforeunload', (event) => {
  const prompt = window.confirm('Are you sure you want to leave?');

  if (!prompt) {
    event.preventDefault();
  }
})
```

- `unload`: This is called before the document is replaced.
- `load`: This is called after the document is replaced.

### DOM diffing

**Please use with caution!**

By default, waystone replaces the entire page when navigating to a new one, which means that every element from the previous page would get disposed. If you want to skip elements that are similar from the previous page (or any page), you can add `ws:diff` to your `<html>`.

```html
<html ws:diff>
  ...
</html>
```

`ws:diff` utilizes [`morphdom`](https://github.com/patrick-steele-idem/morphdom) and `DOMParser`.

The difference, however, would be:

- Scripts will no longer run on the new page.
- `window`'s `DOMContentLoaded` and `load` events wouldn't work.

## Live demos

- Basic Astro demo [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://codesandbox.io/s/github/LXSMNSYC/waystone/tree/main/examples/demo)
- Astro Blog template demo [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://codesandbox.io/s/github/LXSMNSYC/waystone/tree/main/examples/blogs-demo)

## Sponsors

![Sponsors](https://github.com/lxsmnsyc/sponsors/blob/main/sponsors.svg?raw=true)

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
