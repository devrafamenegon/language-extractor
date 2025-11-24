/**
 * Junta linhas no estilo do pré-processador C/C++ (line splicing),
 * substituindo a sequência `\\\n` ou `\\\r\n` por espaços para
 * preservar o comprimento do texto e, portanto, os índices.
 */
export function lineSplicing(sourceCode: string): string {
  // Captura \\\r\n, \\\n ou \\\r (um único backslash seguido da quebra de linha)
  return sourceCode.replace(/\\\r\n|\\\n|\\\r/g, match => ' '.repeat(match.length));
}


