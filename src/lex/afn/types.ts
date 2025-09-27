/**
 * Predicado de caractere: retorna true quando o caractere pertence à classe.
 * Usado para criar transições consumindo um caractere do input.
 */
export type CharPredicate = (ch: string) => boolean;

/**
 * Estado de um AFN.
 * - epsilon: transições que não consomem caractere (epsilon-closures).
 * - transitions: transições condicionadas a um predicado de caractere.
 * - acceptLabel: rótulo do token quando este estado é de aceitação.
 * - priority: prioridade para desempate entre matches de mesmo comprimento (menor é preferido).
 */
export type AfnState = {
  id: number;
  epsilon: AfnState[];
  transitions: Array<{ test: CharPredicate; to: AfnState }>;
  acceptLabel?: string;
  priority?: number;
};

/**
 * Autômato Finito Não-determinístico (AFN) com um estado inicial e
 * um conjunto de estados de aceitação.
 */
export type Afn = {
  start: AfnState;
  accepts: Set<AfnState>;
};

/**
 * AFN anotado com rótulo e prioridade para composição do "mega AFN".
 */
export type LabeledAfn = {
  afn: Afn;
  label: string;
  priority: number;
};

/**
 * Resultado de uma correspondência: comprimento do match, rótulo e prioridade
 * do estado de aceitação que determinou o melhor match.
 */
export type MatchResult = {
  length: number;
  label: string;
  priority: number;
};


