/**
 * Módulo do compilador - orquestra as fases de análise.
 * 
 * Este módulo é genérico e independente de linguagem.
 */
export * from './Compiler';
export * from './types';
export * from './strategies/LexerStrategy';
export * from './strategies/ParserStrategy';
export * from './strategies/SemanticStrategy';
export * from './stages/LexerStage';
export * from './stages/ParserStage';
export * from './stages/SemanticStage';
