import type { RelGeoSemanticLine, RelGeoSemanticToken } from '@relgeo/language-service';

export type HastChild =
  | { type: 'text'; value: string }
  | {
      type: 'element';
      tagName: string;
      properties?: Record<string, unknown>;
      children?: HastChild[];
    };

export type RelGeoHighlightedSourceLine = {
  text: string;
  lineNumber: number;
  blockId?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildTokenChildren(
  line: string,
  tokens: RelGeoSemanticToken[],
  classPrefix: string
): HastChild[] {
  const children: HastChild[] = [];
  let cursor = 0;

  for (const token of tokens) {
    if (token.start > cursor) {
      children.push({ type: 'text', value: line.slice(cursor, token.start) });
    }

    children.push({
      type: 'element',
      tagName: 'span',
      properties: {
        className: [`${classPrefix}__token`, `${classPrefix}__token--${token.kind}`],
        dataTokenKind: token.kind,
      },
      children: [{ type: 'text', value: line.slice(token.start, token.end) }],
    });

    cursor = token.end;
  }

  if (cursor < line.length) {
    children.push({ type: 'text', value: line.slice(cursor) });
  }

  return children;
}

function buildTokenHtml(
  lineText: string,
  tokens: RelGeoSemanticToken[],
  classPrefix: string
): string {
  let cursor = 0;
  let html = '';

  for (const token of tokens) {
    if (token.start > cursor) {
      html += escapeHtml(lineText.slice(cursor, token.start));
    }

    html += `<span class="${classPrefix}__token ${classPrefix}__token--${token.kind}" data-token-kind="${token.kind}">${escapeHtml(
      lineText.slice(token.start, token.end)
    )}</span>`;
    cursor = token.end;
  }

  if (cursor < lineText.length) {
    html += escapeHtml(lineText.slice(cursor));
  }

  return html;
}

export function buildHighlightedChildren(
  source: string,
  semanticLines: RelGeoSemanticLine[],
  classPrefix: string
): HastChild[] {
  return source.split('\n').map((line, index, lines) => {
    const semanticLine = semanticLines[index];
    const children: HastChild[] = buildTokenChildren(line, semanticLine?.tokens ?? [], classPrefix);
    if (index < lines.length - 1) {
      children.push({ type: 'text', value: '\n' });
    }

    return {
      type: 'element',
      tagName: 'span',
      properties: {
        className: ['rg-line'],
        dataLine: index + 1,
      },
      children,
    };
  });
}

export function buildHighlightedHtml(
  sourceLines: RelGeoHighlightedSourceLine[],
  semanticLines: RelGeoSemanticLine[],
  classPrefix: string
): string {
  return sourceLines
    .map((line, index) => {
      const blockAttr = line.blockId
        ? ` data-block-id="${escapeHtml(line.blockId)}"`
        : '';

      return `<span class="rg-line" data-line="${line.lineNumber}"${blockAttr}>${buildTokenHtml(
        line.text,
        semanticLines[index]?.tokens ?? [],
        classPrefix
      )}</span>`;
    })
    .join('');
}
