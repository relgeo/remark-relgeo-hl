# @relgeo/remark-relgeo-hl

Remark plugin for highlighting RelGeo source inside fenced code blocks with the
language id `rg`.

## Versioning

The `@relgeo/remark-relgeo-hl` package is currently `0.5.0`, on the RelGeo DSL `v0.5` compatibility line. Patch releases may move independently; a breaking language-contract change moves the coordinated package line to `0.6.x`.

## Intent

This package is the markdown-facing adapter for RelGeo source highlighting.

It does not render preview SVG. Its job is to:

1. detect fenced code `rg`
2. preserve readable source output
3. consume semantic token spans from `@relgeo/language-service`
4. add stable classes and metadata for styling

Detailed package plan:

1. `DEVELOPMENT-PLAN.md`

## Usage

Register the plugin in a remark-based Markdown pipeline:

```js
import remarkRelgeoHl from '@relgeo/remark-relgeo-hl';

remarkPlugins: [remarkRelgeoHl]
```

Use the `rg` fence when the source itself should remain visible and readable:

````md
```rg
version: 0.5
objects:
  panel:
    type: rect
    size: [80, 40]
```
````

The plugin preserves the code-oriented shape `pre > code`, wraps each source
line with `rg-line`, and marks semantic spans with classes such as
`relgeo-hl__token--keyword` and `relgeo-hl__token--reference`.

If the language service fails, the default tolerant policy keeps the original
source visible as unhighlighted `pre > code` text and emits a serialized
`data-relgeo-diagnostic` with block location. Set
`failurePolicy: 'strict'` to throw `RemarkRelgeoHlError` instead.

## Output Contract

The wrapper carries stable metadata for consumer styling and testing:

```html
<pre class="astro-code relgeo-hl relgeo-hl--rg" data-relgeo-kind="highlight" data-relgeo-fence="rg">
  <code class="language-rg relgeo-hl__code">...</code>
</pre>
```

Both normal and fallback output expose the active `0.5` DSL and `0.5.x`
package-line provenance through `data-relgeo-dsl-version` and
`data-relgeo-package-line`.

The plugin does not render SVG or preview images. Pair it with `@relgeo/remark-relgeo`
only when a document intentionally needs both source and rendered-artifact
surfaces.

## Current Status

The current scaffold provides a safe first implementation:

1. detects `rg` blocks
2. preserves source as markdown-renderable code output
3. consumes token spans from `@relgeo/language-service`
4. annotates tokens, lines, and wrapper nodes with stable classes

## Contract Tests

Run the package tests after changing tokenization or output structure:

```sh
pnpm test
```
