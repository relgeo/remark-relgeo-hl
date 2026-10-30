import type { Code, Root } from 'mdast';
import { RelGeoLanguageService } from '@relgeo/language-service';
import type { RelGeoSemanticLine } from '@relgeo/language-service';
import { visit } from 'unist-util-visit';
import { buildHighlightedChildren } from './render';

export const RELGEO_DSL_VERSION = '0.5';
export const RELGEO_PACKAGE_LINE = '0.5.x';

export type RemarkRelgeoHlFailurePolicy = 'tolerant' | 'strict';

export interface RemarkRelgeoHlDiagnostic {
  code: 'HIGHLIGHT_SERVICE_FAILED';
  severity: 'error';
  message: string;
  phase: 'highlight';
  location: {
    fence: string;
    range?: {
      start: { line: number; column: number; offset?: number };
      end: { line: number; column: number; offset?: number };
    };
  };
}

export class RemarkRelgeoHlError extends Error {
  readonly diagnostic: RemarkRelgeoHlDiagnostic;

  constructor(diagnostic: RemarkRelgeoHlDiagnostic) {
    super(diagnostic.message);
    this.name = 'RemarkRelgeoHlError';
    this.diagnostic = diagnostic;
  }
}

export interface RemarkRelgeoHlOptions {
  classPrefix?: string;
  fence?: string;
  failurePolicy?: RemarkRelgeoHlFailurePolicy;
  languageService?: Pick<RelGeoLanguageService, 'getSemanticTokens'>;
}

type AnnotatedCode = Code & {
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: import('./render').HastChild[];
  };
  meta?: string | null;
};

function createHighlightDiagnostic(
  error: unknown,
  code: AnnotatedCode,
  fence: string,
): RemarkRelgeoHlDiagnostic {
  const position = code.position;
  return {
    code: 'HIGHLIGHT_SERVICE_FAILED',
    severity: 'error',
    message: error instanceof Error ? error.message : String(error),
    phase: 'highlight',
    location: {
      fence,
      ...(position ? { range: position } : {}),
    },
  };
}

function serializeDiagnostic(diagnostic: RemarkRelgeoHlDiagnostic): string {
  return JSON.stringify(diagnostic);
}

export function remarkRelgeoHl(options: RemarkRelgeoHlOptions = {}) {
  const fence = options.fence ?? 'rg';
  const classPrefix = options.classPrefix ?? 'relgeo-hl';
  const languageService = options.languageService ?? new RelGeoLanguageService();
  const failurePolicy = options.failurePolicy ?? 'tolerant';

  return function transformer(tree: Root) {
    visit(tree, 'code', (node) => {
      const code = node as AnnotatedCode;
      if (code.lang !== fence) return;

      let semanticLines: RelGeoSemanticLine[] = [];
      let diagnostic: RemarkRelgeoHlDiagnostic | null = null;

      try {
        semanticLines = languageService.getSemanticTokens(code.value);
      } catch (error) {
        diagnostic = createHighlightDiagnostic(error, code, fence);
        if (failurePolicy === 'strict') {
          throw new RemarkRelgeoHlError(diagnostic);
        }
      }

      code.lang = null;

      code.data = {
        ...(code.data ?? {}),
        hName: 'pre',
        hProperties: {
          className: [
            'astro-code',
            classPrefix,
            `${classPrefix}--${fence}`,
            ...(diagnostic ? [`${classPrefix}--fallback`] : []),
          ],
          'data-relgeo-kind': diagnostic ? 'highlight-error' : 'highlight',
          'data-relgeo-fence': fence,
          'data-relgeo-dsl-version': RELGEO_DSL_VERSION,
          'data-relgeo-package-line': RELGEO_PACKAGE_LINE,
          'data-relgeo-plugin': 'remark-relgeo-hl',
          'data-relgeo-meta': code.meta ?? '',
          ...(diagnostic
            ? {
                'data-relgeo-diagnostic': serializeDiagnostic(diagnostic),
                role: 'alert',
              }
            : {}),
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
