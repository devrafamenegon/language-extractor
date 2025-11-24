/**
 * Tipos genéricos de erros de análise.
 * Independente de linguagem.
 */

export enum ErrorPhase {
  LEXICAL = 'lexico',
  SYNTACTIC = 'sintatico',
  SEMANTIC = 'semantico'
}

/**
 * Interface base para qualquer erro de análise.
 */
export interface AnalysisError {
  fase: string;
  mensagem: string;
  linha: number;
  coluna: number;
  trecho?: string | undefined;
}

/**
 * Erro léxico genérico.
 */
export interface LexicalError extends AnalysisError {
  fase: 'lexico';
  tipo: string;
}

/**
 * Erro sintático genérico.
 */
export interface SyntacticError extends AnalysisError {
  fase: 'sintatico';
  tipo: string;
  esperado?: string | undefined;
  encontrado?: string | undefined;
}

/**
 * Erro semântico genérico.
 */
export interface SemanticError extends AnalysisError {
  fase: 'semantico';
  tipo: string;
  identificador?: string;
}

/**
 * União de todos os tipos de erro.
 */
export type AnyError = LexicalError | SyntacticError | SemanticError;

/**
 * Coleção completa de erros por fase.
 */
export interface ErrorCollection {
  lexicos: LexicalError[];
  sintaticos: SyntacticError[];
  semanticos: SemanticError[];
  total: number;
}

