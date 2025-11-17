/**
 * Constrói os índices de início de linha (0-based).
 * A primeira linha sempre inicia em 0.
 */
export function buildLineStartIndices(source: string): number[] {
  const starts: number[] = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\n') {
      starts.push(i + 1);
    }
  }
  return starts;
}

/**
 * Converte índice absoluto (0-based) em (linha, coluna) 1-based.
 * Implementa busca binária sobre `lineStarts`.
 */
export function indexToLineCol(lineStarts: number[], index: number): { line: number; column: number } {
  // clamp
  if (index < 0) index = 0;
  if (index > (lineStarts[lineStarts.length - 1] ?? 0) && lineStarts.length === 1) {
    // texto sem quebras
  }
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const start = lineStarts[mid] ?? Number.NEGATIVE_INFINITY;
    const nextStart = (mid + 1 < lineStarts.length ? lineStarts[mid + 1] : undefined) ?? Number.POSITIVE_INFINITY;
    if (index < start) {
      high = mid - 1;
    } else if (index >= nextStart) {
      low = mid + 1;
    } else {
      const line = mid + 1; // 1-based
      const column = index - start + 1; // 1-based
      return { line, column };
    }
  }
  // fallback
  const lastStart = lineStarts[lineStarts.length - 1] ?? 0;
  return { line: lineStarts.length, column: index - lastStart + 1 };
}


