/**
 * Remove comentários (/* *\/ e //) preservando o comprimento do texto.
 * Substitui o conteúdo por espaços para manter índices absolutos estáveis.
 */
export function stripComments(sourceCode: string): string {
  const withoutBlock = sourceCode.replace(/\/\*[\s\S]*?\*\//g, m => ' '.repeat(m.length));
  const withoutLine = withoutBlock.replace(/(^|[^:])\/\/.*$/gm, (m, p1) => p1 + ' '.repeat(m.length - p1.length));
  return withoutLine;
}


