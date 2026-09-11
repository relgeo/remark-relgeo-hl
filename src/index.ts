import type { Code, Root } from 'mdast';
import { RelGeoLanguageService } from '@relgeo/language-service';
import { visit } from 'unist-util-visit';
import { buildHighlightedChildren } from './render';

export interface RemarkRelgeoHlOptions {
  classPrefix?: string;
  fence?: string;
  languageService?: RelGeoLanguageService;
}

type AnnotatedCode = Code & {
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: import('./render').HastChild[];
  };
  meta?: string | null;
};

export function remarkRelgeoHl(options: RemarkRelgeoHlOptions = {}) {
  const fence = options.fence ?? 'rg';
  const classPrefix = options.classPrefix ?? 'relgeo-hl';
  const languageService = options.languageService ?? new RelGeoLanguageService();

  return function transformer(tree: Root) {
    visit(tree, 'code', (node) => {
      const code = node as AnnotatedCode;
      if (code.lang !== fence) return;

      const semanticLines = languageService.getSemanticTokens(code.value);

      code.lang = null;

      code.data = {
        ...(code.data ?? {}),
        hName: 'pre',
        hProperties: {
          className: ['astro-code', classPrefix, `${classPrefix}--${fence}`],
          'data-relgeo-kind': 'highlight',
          'data-relgeo-fence': fence,
          'data-relgeo-meta': code.meta ?? '',
        },
        hChildren: [
          {
            type: 'element',
            tagName: 'code',
            properties: {
              className: [`language-${fence}`, `${classPrefix}__code`],
            },
            children: buildHighlightedChildren(code.value, semanticLines, classPrefix),
          },
        ],
      };
    });
  };
}

export * from './render';
export default remarkRelgeoHl;
