import { Token } from '../compiler/strategies/LexerStrategy';
import { ErrorCollection } from '../error';

/**
 * Contexto de exportação contendo todos os dados necessários (genérico).
 */
export interface ExportContext<T extends Token = Token> {
  tokens: T[];
  errors: ErrorCollection;
  filePath: string;
  resultsDir: string;
}

/**
 * Estratégia de exportação (Strategy Pattern - genérica).
 * Permite diferentes formatos de saída (Console, JSON, CSV, etc.).
 */
export interface ExporterStrategy<T extends Token = Token> {
  execute(context: ExportContext<T>): Promise<void>;
}

// Aliases para compatibilidade (deprecados)
export type OutputContext<T extends Token = Token> = ExportContext<T>;
export type OutputStrategy<T extends Token = Token> = ExporterStrategy<T>;
