# remark-relgeo-hl

Remark plugin for highlighting RelGeo source inside fenced code blocks with the
language id `rg`.

## Versioning

The package metadata version (`0.5.0`) is independent from the active RelGeo DSL contract version (`v0.5`). This plugin presents source from the DSL contract; package releases and language-contract revisions are tracked separately.

## Intent

This package is the markdown-facing adapter for RelGeo source highlighting.

It does not render preview SVG. Its job is to:

1. detect fenced code `rg`
2. preserve readable source output
3. consume semantic token spans from `relgeo-language-service`
4. add stable classes and metadata for styling

Detailed package plan:

1. `DEVELOPMENT-PLAN.md`

## Usage

Register the plugin in a remark-based Markdown pipeline:

```js
import remarkRelgeoHl from 'remark-relgeo-hl';

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

## Output Contract

The wrapper carries stable metadata for consumer styling and testing:

```html
<pre class="astro-code relgeo-hl relgeo-hl--rg" data-relgeo-kind="highlight" data-relgeo-fence="rg">
  <code class="language-rg relgeo-hl__code">...</code>
</pre>
```

The plugin does not render SVG or preview images. Pair it with `remark-relgeo`
only when a document intentionally needs both source and rendered-artifact
surfaces.

## Current Status

The current scaffold provides a safe first implementation:

1. detects `rg` blocks
2. preserves source as markdown-renderable code output
3. consumes token spans from `relgeo-language-service`
4. annotates tokens, lines, and wrapper nodes with stable classes

## Contract Tests

Run the package tests after changing tokenization or output structure:

```sh
pnpm test
```
