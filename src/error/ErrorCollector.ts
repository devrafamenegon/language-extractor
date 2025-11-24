/**
 * Coletor centralizado de erros de análise.
 * Permite adicionar erros de diferentes fases e consultá-los.
 */
import { ErrorCollection, LexicalError, SyntacticError, SemanticError } from './types';
import { ErrorPhase } from './types';

export class ErrorCollector {
  private lexicos: LexicalError[] = [];
  private sintaticos: SyntacticError[] = [];
  private semanticos: SemanticError[] = [];

  addLexical(error: LexicalError): void {
    this.lexicos.push(error);
  }

  addSyntactic(error: SyntacticError): void {
    this.sintaticos.push(error);
  }

  addSemantic(error: SemanticError): void {
    this.semanticos.push(error);
  }

  getErrors(): ErrorCollection {
    return {
      lexicos: [...this.lexicos],
      sintaticos: [...this.sintaticos],
      semanticos: [...this.semanticos],
      total: this.lexicos.length + this.sintaticos.length + this.semanticos.length,
    };
  }

  hasErrors(): boolean {
    return this.lexicos.length > 0 || this.sintaticos.length > 0 || this.semanticos.length > 0;
  }

  hasErrorsIn(phase: ErrorPhase): boolean {
    switch (phase) {
      case ErrorPhase.LEXICAL:
        return this.lexicos.length > 0;
      case ErrorPhase.SYNTACTIC:
        return this.sintaticos.length > 0;
      case ErrorPhase.SEMANTIC:
        return this.semanticos.length > 0;
    }
  }

  clear(): void {
    this.lexicos = [];
    this.sintaticos = [];
    this.semanticos = [];
  }
}

