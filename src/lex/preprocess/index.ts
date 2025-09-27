export type PreprocessStep = (input: string) => string;

/**
 * Executa etapas de preprocess em sequência, retornando o texto processado.
 * Todas as etapas devem preservar comprimento para manter índices.
 */
export function runPreprocessPipeline(sourceCode: string, steps: ReadonlyArray<PreprocessStep>): string {
  let out = sourceCode;
  for (const step of steps) {
    out = step(out);
  }
  return out;
}


