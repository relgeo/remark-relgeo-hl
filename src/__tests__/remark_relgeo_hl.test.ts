import { describe, expect, it } from 'vitest';
import type { Root } from 'mdast';
import { RelGeoLanguageService } from '@relgeo/language-service';
import { buildHighlightedHtml, remarkRelgeoHl } from '../index';

type HighlightedChild = {
  type: 'element' | 'text';
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HighlightedChild[];
  value?: string;
};

type HighlightedCodeNode = {
  lang: string | null;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: Array<{
      type: 'element';
      tagName: string;
      properties?: Record<string, unknown>;
      children?: HighlightedChild[];
    }>;
  };
};

function runPlugin(source: string) {
  const tree: Root = {
    type: 'root',
    children: [
      {
        type: 'code',
        lang: 'rg',
        meta: null,
        value: source,
      },
    ],
  };

  const transformer = remarkRelgeoHl({
    languageService: new RelGeoLanguageService(),
  });
  transformer(tree);

  return tree.children[0] as HighlightedCodeNode;
}

describe('@relgeo/remark-relgeo-hl', () => {
  it('converts rg fences into pre > code with semantic token spans', () => {
    const node = runPlugin(`objects:
  panel:
    type: rect
    size: [80mm, 40]
    center: panel.center
    meta:
      strokeWidth: 1
      role: centerline
      intent: datum
      fill: none
      width: 2
    place:
      center: panel.center
    style: guideLine
parameters:
  width:
    default: max(distance(panel.center, panel.right), 80mm)
views:
  front:
    target: panel
    scale: 1
    filter:
      roles: [final]
repeatTest:
  spacing: fixed-distance
  pick: first
derived:
  itemCount: count(panel.holes) # note`);

    expect(node.lang).toBeNull();
    expect(node.data?.hName).toBe('pre');
    expect(node.data?.hProperties?.['data-relgeo-kind']).toBe('highlight');

    const codeChild = node.data?.hChildren?.[0];
    expect(codeChild?.tagName).toBe('code');

    const lines = codeChild?.children ?? [];
    expect(lines).toHaveLength(28);

    const firstLine = lines[0];
    expect(firstLine?.tagName).toBe('span');
    expect(firstLine?.properties?.className).toEqual(['rg-line']);

    const lineChildren = firstLine?.children ?? [];
    const tokenKinds = lineChildren
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(tokenKinds).toContain('container-keyword');

    const valueLine = lines[4];
    const valueTokenKinds = (valueLine?.children ?? [])
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(valueTokenKinds).toContain('geometry-key');
    expect(valueTokenKinds).toContain('reference');

    const metaLine = lines[6];
    const metaTokenKinds = (metaLine?.children ?? [])
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(metaTokenKinds).toContain('meta-key');

    const enumMetaLine = lines[7];
    const enumMetaTokenKinds = (enumMetaLine?.children ?? [])
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(enumMetaTokenKinds).toContain('enum-value');

    const aliasLine = lines[10];
    const aliasTokenKinds = (aliasLine?.children ?? [])
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(aliasTokenKinds).toContain('compat-alias');

    const layoutLine = lines[11];
    const layoutTokenKinds = (layoutLine?.children ?? [])
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(layoutTokenKinds).toContain('layout-key');

    const presentationLine = lines[13];
    const presentationTokenKinds = (presentationLine?.children ?? [])
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(presentationTokenKinds).toContain('compat-alias');

    const parameterLine = lines[15];
    const parameterTokenKinds = (parameterLine?.children ?? [])
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(parameterTokenKinds).toContain('parameter-key');

    const expressionLine = lines[16];
    const expressionTokenKinds = (expressionLine?.children ?? [])
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(expressionTokenKinds).toContain('math-function');
    expect(expressionTokenKinds).toContain('query-function');

    const filterEnumLine = lines[22];
    const filterEnumTokenKinds = (filterEnumLine?.children ?? [])
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(filterEnumTokenKinds).toContain('enum-value');

    const selectorLine = lines[25];
    const selectorTokenKinds = (selectorLine?.children ?? [])
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(selectorTokenKinds).toContain('selector');
    expect(selectorTokenKinds).toContain('geometry-key');

    const finalLine = lines[27];
    const finalTokenKinds = (finalLine?.children ?? [])
      .filter((child) => child.type === 'element')
      .map((child) => child.properties?.dataTokenKind);

    expect(finalTokenKinds).toContain('comment');
    expect(finalTokenKinds).toContain('collection-function');
  });

  it('leaves non-rg fences untouched', () => {
    const tree: Root = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'yaml',
          meta: null,
          value: 'foo: bar',
        },
      ],
    };

    const transformer = remarkRelgeoHl();
    transformer(tree);

    const node = tree.children[0] as HighlightedCodeNode;
    expect(node.lang).toBe('yaml');
    expect(node.data).toBeUndefined();
  });

  it('renders line-based highlighted HTML for animation consumers', () => {
    const sourceLines = [
      { text: 'objects:', lineNumber: 1 },
      { text: '  panel:', lineNumber: 2, blockId: 'panel-block' },
      { text: '    type: rect', lineNumber: 3, blockId: 'panel-block' },
      { text: '    fill: "#fff"', lineNumber: 4, blockId: 'style-block' },
    ];
    const source = sourceLines.map((line) => line.text).join('\n');
    const semanticLines = new RelGeoLanguageService().getSemanticTokens(source);

    const html = buildHighlightedHtml(sourceLines, semanticLines, 'relgeo-hl');

    expect(html).toContain('data-line="1"');
    expect(html).toContain('data-line="4"');
    expect(html).toContain('data-block-id="panel-block"');
    expect(html).toContain('data-block-id="style-block"');
    expect(html).toContain('relgeo-hl__token--container-keyword');
    expect(html).toContain('relgeo-hl__token--object-id');
    expect(html).toContain('relgeo-hl__token--object-type');
    expect(html).toContain('relgeo-hl__token--string');
  });
});
