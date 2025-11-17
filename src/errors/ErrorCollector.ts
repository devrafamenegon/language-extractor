/**
 * Coletor centralizado de erros de análise.
 * Permite adicionar erros de diferentes fases e consultá-los.
 */
import { ErrorCollection, LexicalError, SyntacticError, SemanticError } from './ErrorTypes';

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

  hasErrorsIn(phase: 'lexico' | 'sintatico' | 'semantico'): boolean {
    switch (phase) {
      case 'lexico':
        return this.lexicos.length > 0;
      case 'sintatico':
        return this.sintaticos.length > 0;
      case 'semantico':
        return this.semanticos.length > 0;
    }
  }

  clear(): void {
    this.lexicos = [];
    this.sintaticos = [];
    this.semanticos = [];
  }
}

