/**
 * Remove/macula literais de string e char preservando comprimento.
 * Mantém escapes (\\) como caracteres consumidos ao macular.
 */
export function stripStrings(sourceCode: string): string {
  const pattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  return sourceCode.replace(pattern, match => ' '.repeat(match.length));
}
