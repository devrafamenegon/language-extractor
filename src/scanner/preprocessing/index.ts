export type PreprocessStep = (input: string) => string;

/**
 * Executa pipeline de pré-processamento em sequência.
 */
export function runPreprocessPipeline(sourceCode: string, steps: ReadonlyArray<PreprocessStep>): string {
  let out = sourceCode;
  for (const step of steps) {
    out = step(out);
  }
  return out;
}

// Etapas individuais
export { stripBom } from './stripBOM';
export { lineSplicing } from './lineSplicing';
export { stripComments } from './stripComments';
export { stripStrings } from './stripStrings';

// Pipeline Builder (fluent interface)
export { PreprocessingPipeline } from './PreprocessingPipeline';
