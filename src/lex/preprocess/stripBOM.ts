/**
 * Remove BOM UTF-8 (0xEF 0xBB 0xBF) no início do arquivo.
 * Preserva comprimento substituindo por três espaços.
 */
export function stripBom(sourceCode: string): string {
  if (sourceCode.startsWith('\uFEFF')) {
    return ' ' + sourceCode.slice(1);
  }
  return sourceCode;
}


