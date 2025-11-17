/**
 * Implementações concretas de tokenização para C/C++.
 * 
 * Estas são as implementações que fazem o trabalho real de análise léxica.
 * As estratégias (strategies.ts) são wrappers que chamam essas implementações.
 */

export { tokenizeOrdered } from './manual';
export { tokenizeOrderedAfn } from './afn';

