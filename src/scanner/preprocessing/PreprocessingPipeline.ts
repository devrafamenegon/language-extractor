/**
 * Pipeline Pattern para pré-processamento com Builder fluente.
 * 
 * Permite construir pipelines de transformação de forma declarativa.
 */

export type PreprocessStep = (input: string) => string;

export class PreprocessingPipeline {
  private source: string;
  private steps: PreprocessStep[] = [];

  constructor(sourceCode: string) {
    this.source = sourceCode;
  }

  addStep(step: PreprocessStep): this {
    this.steps.push(step);
    return this;
  }

  addSteps(steps: PreprocessStep[]): this {
    this.steps.push(...steps);
    return this;
  }
  
  execute(): string {
    let result = this.source;
    for (const step of this.steps) {
      result = step(result);
    }
    return result;
  }

  /**
   * Retorna as etapas configuradas (útil para debug).
   */
  getSteps(): readonly PreprocessStep[] {
    return [...this.steps];
  }
}

