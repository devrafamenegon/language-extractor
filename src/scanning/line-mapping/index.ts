/**
 * Mapeamento de índices para posições (linha, coluna).
 * 
 * Converte índices absolutos (0-based) em coordenadas
 * legíveis (linha 1-based, coluna 1-based) para mensagens de erro.
 * 
 * Uso:
 * ```ts
 * const lineStarts = buildLineStartIndices(sourceCode);
 * const { line, column } = indexToLineCol(lineStarts, 42);
 * console.log(`Erro na linha ${line}, coluna ${column}`);
 * ```
 */

export { buildLineStartIndices, indexToLineCol } from './lineIndex';
