# ModernToast

A small toast library for the browser. No npm dependencies, no framework.

Drop in two files. Call `ModernToast.show()`. Get a handle back.

```js
const toast = ModernToast.success(
  'Saved',
  'The file is already in the library.'
)

await toast
toast.dismiss()
```

Light, dark, or follow the system. Cards stack in a corner and older ones recede until you hover.

[Live playground](https://paulsdigital.github.io/modern-toast/)

## What you get

- Toast first, decoration second — title, text, a close button (`icon` is off by default)
- Semantic types: `success`, `error`, `warning`, `info`
- Six positions, hover-pause, an optional timer bar, and older toasts that fade back
- HTML, links, and a promise when the card leaves — CSS plus one script, no bundler

## Setup

`window.ModernToast` is set for CDN tags; bundlers should import the default export.

### npm

```bash
npm install modern-toast
```

```js
import ModernToast from 'modern-toast'
import 'modern-toast/modern-toast.css'

ModernToast.success('Saved', 'The file is already in the library.')
```

Named import works too: `import { ModernToast } from 'modern-toast'`.

Without a bundler, load CSS then the IIFE file:

```html
<link rel="stylesheet" href="node_modules/modern-toast/src/modern-toast.css">
<script src="node_modules/modern-toast/src/modern-toast.js"></script>
```

### CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-toast@1.2.0/src/modern-toast.css">
<script src="https://cdn.jsdelivr.net/npm/modern-toast@1.2.0/src/modern-toast.js"></script>
```

Pin a version. `@latest` will follow new releases.

TypeScript types ship in the package (`src/modern-toast.d.ts`).

### Copy the files

Copy `src/modern-toast.css` and `src/modern-toast.js` into your project:

```html
<link rel="stylesheet" href="src/modern-toast.css">
<script src="src/modern-toast.js"></script>
```

## Usage

### A simple message

```js
ModernToast.success('Saved', 'The file is already in the library.')
ModernToast.error('Could not save', 'Check your connection and try again.')
```

### Full options

```js
ModernToast.show({
  type: 'success',
  title: 'Deployed',
  text: 'v2.4.1 is live.',
  theme: 'dark',          // auto | light | dark
  position: 'top-right',  // six corners
  duration: 4000,         // 0 keeps it until dismissed
  closable: true,
  icon: true,             // circular SVG type mark
  progress: true,         // opt-in bottom bar for remaining time
  recede: true
})
```

Shorthand helpers take an optional third argument for any option:

```js
ModernToast.success('Saved', 'All set.', { theme: 'dark', icon: true })
```

### HTML inside the body

```js
ModernToast.show({
  title: "What's new",
  html: '<p>You can pass <strong>your own markup</strong>.</p>'
})
```

Markup is sanitized: scripts, event handlers, and `javascript:` URLs are stripped.

### Clickable toast

```js
ModernToast.info('Release notes', 'Open the changelog.', {
  href: 'https://example.com',
  hrefTarget: '_blank'
})
```

### Keep it on screen

```js
const toast = ModernToast.warning('Still unsigned', 'The contract is waiting.', {
  duration: 0
})

// later
toast.dismiss()
```

App-wide options without repeating them:

```js
ModernToast.setDefaults({
  theme: 'dark',
  position: 'bottom-right',
  duration: 5000
})
```

A later `show({ theme: 'light' })` overrides only that call. `getDefaults()` returns the merged values. Pass `null` for a key to clear it.

To style a card from your CSS, pass a class. A string goes on the card; an object targets parts:

```js
ModernToast.show({
  title: 'Invoice sent',
  customClass: 'invoice-toast'
})

ModernToast.show({
  title: 'Invoice sent',
  customClass: { item: 'invoice-toast', title: 'invoice-title' }
})
```

## Options

| Option | Default | Meaning |
| --- | --- | --- |
| `type` | `'info'` | `success` `error` `warning` `info` |
| `title` | `''` | Heading |
| `text` | `''` | Body text. Ignored if `html` is set |
| `html` | `''` | Sanitized markup for the body |
| `theme` | `'auto'` | Follows `prefers-color-scheme`, or `'light'` / `'dark'` |
| `position` | `'top-right'` | `top-left` `top-center` `top-right` `bottom-left` `bottom-center` `bottom-right` |
| `duration` | `4000` | Auto-dismiss after N milliseconds. `0` stays until dismissed |
| `closable` | `true` | Show the close button |
| `recede` | `true` | Older cards in the stack fade until you hover the stack |
| `pauseOnHover` | `true` | Hover pauses the auto-dismiss timer and the progress bar |
| `icon` | `false` | `true` shows the animated type icon |
| `progress` | `false` | `true` shows a bottom bar that shrinks with the remaining duration. Hidden when `duration` is `0` |
| `href` | `''` | If set, clicking the card opens this URL |
| `hrefTarget` | `'_self'` | `'_blank'` opens a new tab |
| `width` | `0` | Card width in pixels. `0` uses the default |
| `gap` | `12` | Space between stacked cards |
| `offsetX` | `20` | Distance from the left or right edge |
| `offsetY` | `20` | Distance from the top or bottom edge |
| `customClass` | `null` | Extra class on the card, or `{ dock, item, icon, title, text, close, progress }` |
| `id` | auto | Reusing an id replaces the existing card |
| `onShow` | `null` | `({ id }) => {}` |
| `onDismiss` | `null` | `({ id, dismiss }) => {}` |

## The handle

Every call returns a thenable:

```ts
{
  id: string
  dismiss(): Promise<ToastResult>  // same as closing the card
}

// when the card leaves:
{
  id: string
  dismiss: 'close' | 'timer' | 'click' | 'api' | 'replace'
}
```

```js
const toast = ModernToast.success('Saved', 'All set.')
ModernToast.isVisible() // true
await toast             // { id: 'mt-1', dismiss: 'timer' }
```

## API map

| Call | What it does |
| --- | --- |
| `show(options)` | Full toast |
| `show(title, text, type)` | Same, positional |
| `success` `error` `warning` `info` | Typed helpers |
| `dismiss(id)` | Close one card |
| `dismiss()` / `dismissAll()` | Close every card |
| `setDefaults(options)` | Merge app-wide option defaults |
| `getDefaults()` | Current merged defaults |
| `isVisible()` | Whether any card is on screen |

## License

MIT
