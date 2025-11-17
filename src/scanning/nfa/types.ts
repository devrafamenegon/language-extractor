/**
 * Tipos para NFAs (Non-deterministic Finite Automata).
 * Implementação baseada em Thompson Construction.
 */

/**
 * Predicado de caractere para transições.
 * Retorna true quando o caractere satisfaz a condição.
 */
export type CharPredicate = (ch: string) => boolean;

/**
 * Estado de um NFA.
 * - epsilon: transições epsilon (não consomem caractere)
 * - transitions: transições por caractere
 * - acceptLabel: rótulo quando é estado de aceitação
 * - priority: desempate em matches de mesmo tamanho (menor ganha)
 */
export type AfnState = {
  id: number;
  epsilon: AfnState[];
  transitions: Array<{ test: CharPredicate; to: AfnState }>;
  acceptLabel?: string;
  priority?: number;
};

/**
 * NFA completo (estado inicial + estados de aceitação).
 */
export type Afn = {
  start: AfnState;
  accepts: Set<AfnState>;
};

/**
 * NFA com rótulo e prioridade para combinação.
 */
export type LabeledAfn = {
  afn: Afn;
  label: string;
  priority: number;
};

/**
 * Resultado de um match bem-sucedido.
 */
export type MatchResult = {
  length: number;
  label: string;
  priority: number;
};


