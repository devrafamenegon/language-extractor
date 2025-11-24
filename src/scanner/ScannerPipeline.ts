/**
 * Pipeline Pattern para coordenar todas as etapas de scanning.
 * 
 * Fluxo:
 * 1. Preprocessing (transformações de texto)
 * 2. Position mapping (build line indices)
 * 3. Ready for tokenization
 */

import { PreprocessStep, runPreprocessPipeline } from './preprocessing';
import { buildLineStartIndices } from './position';

export interface ScannerResult {
  original: string;
  preprocessed: string;
  lineStarts: number[];
}

export class ScannerPipeline {
  private source: string;
  private preprocessSteps: PreprocessStep[] = [];
  private buildLineMap: boolean = false;

  constructor(sourceCode: string) {
    this.source = sourceCode;
  }

  withPreprocessing(steps: PreprocessStep[]): this {
    this.preprocessSteps = steps;
    return this;
  }

  withLineMapping(): this {
    this.buildLineMap = true;
    return this;
  }

  build(): ScannerResult {
    const preprocessed = this.preprocessSteps.length > 0
      ? runPreprocessPipeline(this.source, this.preprocessSteps)
      : this.source;

    const lineStarts = this.buildLineMap
      ? buildLineStartIndices(this.source)
      : [];

    return {
      original: this.source,
      preprocessed,
      lineStarts,
    };
  }
}

